import { CannonRegistry } from '@usecannon/builder';
import { ethers } from 'ethers';
import prompts from 'prompts';
import os from 'os';
import { resolve } from 'path';
import { findPackage } from '../helpers';

export async function publish(
  cannonDirectory: string,
  privateKey: string,
  packageRef: string,
  tags: string,
  registryAddress: string,
  registryEndpoint: string,
  ipfsEndpoint: string,
  ipfsAuthorizationHeader: string
) {
  cannonDirectory = resolve(cannonDirectory.replace(/^~(?=$|\/|\\)/, os.homedir()));
  const packageName = packageRef.split(':')[0];
  const packageVersion = packageRef.includes(':') ? packageRef.split(':')[1] : 'latest';

  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.providers.JsonRpcProvider(registryEndpoint);
  const signer = provider.getSigner(wallet.address);

  const response = await prompts({
    type: 'confirm',
    name: 'confirmation',
    message: `This will deploy your package to IPFS and use ${wallet.address} to add the package to the registry. (This will cost a small amount of gas.) Continue?`,
    initial: true,
  });

  if (!response.confirmation) {
    process.exit();
  }

  const ipfsOptions = {
    url: ipfsEndpoint,
    headers: {
      authorization: ipfsAuthorizationHeader,
    },
  };

  const registry = new CannonRegistry({
    ipfsOptions,
    signerOrProvider: signer,
    address: registryAddress,
  });

  const splitTags = tags.split(',');

  console.log(`Uploading and registering package ${packageName}:${packageVersion}...`);

  const txn = await registry.uploadPackage(
    `${packageName}:${packageVersion}`,
    tags ? splitTags : undefined,
    cannonDirectory
  );

  console.log('txn:', txn.transactionHash, txn.status);

  console.log('Complete!');
}