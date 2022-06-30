import { Signer } from 'ethers';
import { ok, equal, deepEqual } from 'assert/strict';
import { ethers } from 'hardhat';
import { CannonRegistry as TCannonRegistry } from '../../typechain-types/contracts/CannonRegistry';

import assertRevert from '../helpers/assert-revert';

const toBytes32 = ethers.utils.formatBytes32String;

describe('CannonRegistry', function () {
  let registry: TCannonRegistry;
  let user1: Signer, user2: Signer, user3: Signer;

  before('identify signers', async function () {
    [user1, user2, user3] = await ethers.getSigners();
  });

  before('deploy contract', async function () {
    const CannonRegistry = await ethers.getContractFactory('CannonRegistry');
    const implementation = await CannonRegistry.deploy();
    await implementation.deployed();
    const Proxy = await ethers.getContractFactory('Proxy');
    const proxy = await Proxy.deploy(implementation.address);
    await proxy.deployed();

    registry = (await ethers.getContractAt(
      'CannonRegistry',
      proxy.address
    )) as TCannonRegistry;

    const owner = await user1.getAddress();
    await registry.nominateNewOwner(owner).then((tx) => tx.wait());
    await registry.acceptOwnership().then((tx) => tx.wait());
  });

  describe('Upgradedability', function () {
    let newImplementation: TCannonRegistry;

    before('deploy new implementation', async function () {
      const CannonRegistry = await ethers.getContractFactory('CannonRegistry');
      newImplementation = (await CannonRegistry.deploy()) as TCannonRegistry;
      await newImplementation.deployed();
    });

    it('upgrades to a new implementation', async function () {
      await registry.upgradeTo(newImplementation.address);
      equal(await registry.getImplementation(), newImplementation.address);
    });
  });

  describe('validateProtocolName()', function () {
    it('only allows lowercase letters, numbers, and dashes', async function () {
      equal(
        await registry.validateProtocolName(toBytes32('some--mo-du9le')),
        true
      );
      equal(
        await registry.validateProtocolName(toBytes32('some_-mo-du9le')),
        false
      );
      equal(
        await registry.validateProtocolName(toBytes32('some--mo-du9lE')),
        false
      );
      equal(
        await registry.validateProtocolName(toBytes32('some$module')),
        false
      );
    });

    it('does not allow dash at beginning or end', async function () {
      equal(
        await registry.validateProtocolName(toBytes32('some--module-')),
        false
      );
      equal(
        await registry.validateProtocolName(toBytes32('-some--module')),
        false
      );
    });

    it('enforces minimum length', async function () {
      const testName = 'abcdefghijk';
      const minLength = Number(await registry.MIN_PACKAGE_NAME_LENGTH());

      equal(
        await registry.validateProtocolName(
          toBytes32(testName.slice(0, minLength))
        ),
        true
      );
      equal(
        await registry.validateProtocolName(
          toBytes32(testName.slice(0, minLength - 1))
        ),
        false
      );
    });
  });

  describe('publish()', function () {
    it('should not allow to publish empty url', async function () {
      await assertRevert(async () => {
        await registry.publish(
          toBytes32('some-module'),
          toBytes32('0.0.1'),
          [],
          ''
        );
      }, 'InvalidUrl("")');
    });

    it('should not allow invalid name', async function () {
      await assertRevert(async () => {
        await registry.publish(
          toBytes32('some-module-'),
          toBytes32('0.0.1'),
          [],
          'ipfs://some-module-hash@0.0.1'
        );
      }, 'InvalidName("0x736f6d652d6d6f64756c652d0000000000000000000000000000000000000000")');
    });

    it('should create the first protocol and assign the owner', async function () {
      const tx = await registry
        .connect(user1)
        .publish(
          toBytes32('some-module'),
          toBytes32('0.0.1'),
          [],
          'ipfs://some-module-hash@0.0.1'
        );

      const { events } = await tx.wait();

      equal(events!.length, 1);
      equal(events![0].event, 'ProtocolPublish');

      const resultUrl = await registry.getProtocolUrl(
        toBytes32('some-module'),
        toBytes32('0.0.1')
      );

      equal(resultUrl, 'ipfs://some-module-hash@0.0.1');
    });

    it('should be able to publish new version', async function () {
      const tx = await registry
        .connect(user1)
        .publish(
          toBytes32('some-module'),
          toBytes32('0.0.2'),
          [],
          'ipfs://some-module-hash@0.0.2'
        );

      const { events } = await tx.wait();

      equal(events!.length, 1);
      equal(events![0].event, 'ProtocolPublish');
    });

    it('should be able to update an older version', async function () {
      const tx = await registry
        .connect(user1)
        .publish(
          toBytes32('some-module'),
          toBytes32('0.0.1'),
          [],
          'ipfs://updated-module-hash@0.0.1'
        );

      const { events } = await tx.wait();

      equal(events!.length, 1);
      equal(events![0].event, 'ProtocolPublish');
    });

    it('pushes tags', async function () {
      const tx = await registry.connect(user1).publish(
        toBytes32('some-module'),
        toBytes32('0.0.3'),
        ['latest', 'stable'].map((s) => toBytes32(s)),
        'ipfs://updated-module-hash@0.0.3'
      );

      const { events } = await tx.wait();

      equal(events!.length, 1);
      equal(events![0].event, 'ProtocolPublish');

      equal(
        await registry.getProtocolUrl(
          toBytes32('some-module'),
          toBytes32('latest')
        ),
        'ipfs://updated-module-hash@0.0.3'
      );
      equal(
        await registry.getProtocolUrl(
          toBytes32('some-module'),
          toBytes32('stable')
        ),
        'ipfs://updated-module-hash@0.0.3'
      );
    });

    it('should not allow to modify protocol from another owner', async function () {
      await assertRevert(async () => {
        await registry
          .connect(user2)
          .publish(
            toBytes32('some-module'),
            toBytes32('0.0.4'),
            [],
            'ipfs://updated-module-hash@0.0.4'
          );
      }, 'Unauthorized()');
    });
  });

  describe('nominateProtocolOwner()', function () {
    it('should not allow nomination from non-owner', async function () {
      await assertRevert(async () => {
        await registry
          .connect(user2)
          .nominateProtocolOwner(
            toBytes32('some-module'),
            await user2.getAddress()
          );
      }, 'Unauthorized()');
    });

    it('nominates', async function () {
      await registry
        .connect(user1)
        .nominateProtocolOwner(
          toBytes32('some-module'),
          await user2.getAddress()
        );

      equal(
        await registry.getProtocolNominatedOwner(toBytes32('some-module')),
        await user2.getAddress()
      );
    });
  });

  describe('acceptProtocolOwnership()', function () {
    before('nominate new owner', async function () {
      await registry
        .connect(user1)
        .nominateProtocolOwner(
          toBytes32('some-module'),
          await user2.getAddress()
        );
    });

    it('only nominated owner can accept ownership', async function () {
      await assertRevert(async () => {
        await registry
          .connect(user3)
          .acceptProtocolOwnership(toBytes32('some-module'));
      }, 'Unauthorized()');
    });

    it('accepts ownership', async function () {
      await registry
        .connect(user2)
        .acceptProtocolOwnership(toBytes32('some-module'));
    });
  });

  describe('getProtocols()', function () {
    it('returns created protocols', async function () {
      const result = await registry.connect(user2).getProtocols();
      ok(Array.isArray(result));
    });
  });

  describe('getProtocolVersions()', function () {
    it('returns protocol versions', async function () {
      const result = await registry
        .connect(user2)
        .getProtocolVersions(toBytes32('some-module'));

      deepEqual(result, [
        toBytes32('0.0.1'),
        toBytes32('0.0.2'),
        toBytes32('0.0.3'),
      ]);
    });
  });
});
