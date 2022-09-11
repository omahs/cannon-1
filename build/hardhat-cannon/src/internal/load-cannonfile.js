import fs from 'fs-extra';
import path from 'path';
import toml from '@iarna/toml';
import { HardhatPluginError } from 'hardhat/plugins';
import { ethers } from 'ethers';
import { validateChainDefinition } from '@usecannon/builder';
import { ChainDefinition } from '@usecannon/builder/dist/src/definition';
export default function loadCannonfile(hre, filepath) {
    if (!fs.existsSync(filepath)) {
        throw new HardhatPluginError('cannon', `Cannon file '${filepath}' not found.`);
    }
    const rawDef = toml.parse(fs.readFileSync(filepath).toString('utf8'));
    let pkg = {};
    try {
        pkg = require(path.join(hre.config.paths.root, 'package.json'));
    }
    catch (err) {
        console.warn('package.json file not found! Cannot use field for cannonfile inference');
    }
    if (!rawDef.name || typeof rawDef.name !== 'string') {
        rawDef.name = pkg.name;
    }
    try {
        ethers.utils.formatBytes32String(rawDef.name);
    }
    catch (err) {
        let msg = 'Invalid "name" property on cannonfile.toml. ';
        if (err instanceof Error)
            msg += err.message;
        throw new Error(msg);
    }
    if (!rawDef.version || typeof rawDef.version !== 'string') {
        rawDef.version = pkg.version;
    }
    try {
        ethers.utils.formatBytes32String(rawDef.version);
    }
    catch (err) {
        let msg = 'Invalid "version" property on cannonfile.toml. ';
        if (err instanceof Error)
            msg += err.message;
        throw new Error(msg);
    }
    if (!validateChainDefinition(rawDef)) {
        console.error('cannonfile failed parse:');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const error of validateChainDefinition.errors || []) {
            console.log(`> at .${error.schemaPath}: ${error.message} (${JSON.stringify(error.params)})`);
        }
        throw new Error('failed to parse cannonfile');
    }
    const def = new ChainDefinition(rawDef);
    const ctx = {
        package: fs.readJsonSync(hre.config.paths.root + '/package.json'),
        chainId: hre.network.config.chainId || 31337,
        settings: {},
        timestamp: '0',
        contracts: {},
        txns: {},
        imports: {},
    };
    const name = def.getName(ctx);
    const version = def.getVersion(ctx);
    return { def, name, version };
}
