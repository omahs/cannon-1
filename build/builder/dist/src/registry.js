"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannonRegistry = void 0;
const path_1 = __importDefault(require("path"));
const ethers_1 = require("ethers");
const storage_1 = require("./storage");
const fs_extra_1 = __importDefault(require("fs-extra"));
const _1 = require(".");
const ipfs_http_client_1 = require("ipfs-http-client");
const adm_zip_1 = __importDefault(require("adm-zip"));
const CannonRegistry_json_1 = __importDefault(require("./abis/CannonRegistry.json"));
class CannonRegistry {
    constructor({ address, ipfsOptions = {}, signerOrProvider, }) {
        if (signerOrProvider.provider) {
            this.signer = signerOrProvider;
            this.provider = this.signer.provider;
        }
        else {
            this.provider = signerOrProvider;
        }
        this.contract = new ethers_1.ethers.Contract(address, CannonRegistry_json_1.default, this.provider);
        this.ipfs = (0, ipfs_http_client_1.create)(ipfsOptions);
    }
    publish(name, version, tags, url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            if (!this.signer) {
                throw new Error('Missing signer needed for publishing');
            }
            if ((yield this.signer.getBalance()).lte(0)) {
                throw new Error(`Signer at address ${yield this.signer.getAddress()} is not funded with ETH. Please ensure you have ETH in your wallet in order to publish.`);
            }
            const tx = yield this.contract.connect(this.signer).publish(ethers_1.ethers.utils.formatBytes32String(name), ethers_1.ethers.utils.formatBytes32String(version), tags.map((t) => ethers_1.ethers.utils.formatBytes32String(t)), url);
            return yield tx.wait();
        });
    }
    getUrl(name, version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            return yield this.contract.getPackageUrl(ethers_1.ethers.utils.formatBytes32String(name), ethers_1.ethers.utils.formatBytes32String(version));
        });
    }
    readIpfs(urlOrHash) {
        return __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            const hash = urlOrHash.replace(/^ipfs:\/\//, '');
            const bufs = [];
            try {
                for (var _b = __asyncValues(this.ipfs.cat(hash)), _c; _c = yield _b.next(), !_c.done;) {
                    const chunk = _c.value;
                    bufs.push(chunk);
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        yield _a.call(_b);
                }
                finally {
                    if (e_1)
                        throw e_1.error;
                }
            }
            return Buffer.concat(bufs);
        });
    }
    queryDeploymentInfo(name, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getUrl(name, tag);
            if (!url) {
                return null;
            }
            const manifestData = yield this.readIpfs(url);
            return JSON.parse(manifestData.toString('utf8'));
        });
    }
    downloadPackageChain(image, chainId, preset, packagesDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const [name, tag] = image.split(':');
            preset = preset !== null && preset !== void 0 ? preset : 'main';
            const manifest = yield this.queryDeploymentInfo(name, tag);
            if (!manifest) {
                throw new Error(`package not found: ${name}:${tag}. please check that the requested package exists and try again.`);
            }
            const packageDir = (0, _1.getPackageDir)(packagesDir || (0, _1.getSavedPackagesDir)(), manifest.def.name, manifest.def.version);
            yield fs_extra_1.default.mkdirp(packageDir);
            yield fs_extra_1.default.writeJson((0, _1.getDeploymentInfoFile)(packageDir), manifest);
            if (!manifest.deploys[chainId.toString()] || !manifest.deploys[chainId][preset]) {
                // if we have manifest but no chain files, treat it as undeployed build
                return null;
            }
            // whats nice about this is it will import to the actual directory it belongs to so we can link it later
            const buf = yield this.readIpfs(manifest.deploys[chainId.toString()][preset].ipfsHash);
            const zip = new adm_zip_1.default(buf);
            const dir = path_1.default.dirname((0, _1.getActionFiles)(packageDir, chainId, preset, 'sample').basename);
            yield zip.extractAllTo(dir, true);
            const miscBuf = yield this.readIpfs(manifest.misc.ipfsHash);
            const miscZip = new adm_zip_1.default(miscBuf);
            yield miscZip.extractAllTo(packageDir, true);
            // imported chain may be of a different version from the actual requested tag. Make sure we link if necessary
            yield (0, storage_1.associateTag)(packagesDir || (0, _1.getSavedPackagesDir)(), manifest.def.name, manifest.def.version, tag);
            return manifest.deploys[chainId.toString()][preset];
        });
    }
    uploadPackage(image, tags, packagesDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const [name, tag] = image.split(':');
            packagesDir = packagesDir || (0, _1.getSavedPackagesDir)();
            const packageDir = (0, _1.getPackageDir)(packagesDir, name, tag);
            const manifest = yield (0, _1.getAllDeploymentInfos)(packageDir);
            if (!manifest) {
                throw new Error('package not found for upload ' + image);
            }
            // start uploading everything
            for (const chainId in manifest.deploys) {
                for (const preset in manifest.deploys[chainId]) {
                    const zip = new adm_zip_1.default();
                    const folder = path_1.default.dirname((0, _1.getActionFiles)(packageDir, parseInt(chainId), preset, 'sample').basename);
                    yield zip.addLocalFolderPromise(folder, {});
                    const buf = yield zip.toBufferPromise();
                    const ipfsInfo = yield this.ipfs.add(buf);
                    // update IPFS hashes as we go
                    manifest.deploys[chainId][preset].ipfsHash = ipfsInfo.cid.toV0().toString();
                }
            }
            // upload the misc artifacts
            const miscZip = new adm_zip_1.default();
            // contracts may not be deployed in which case, contracts folder is not created
            if (fs_extra_1.default.existsSync(path_1.default.join(packageDir, 'contracts'))) {
                yield miscZip.addLocalFolderPromise(path_1.default.join(packageDir, 'contracts'), { zipPath: 'contracts' });
            }
            const miscIpfsInfo = yield this.ipfs.add(yield miscZip.toBufferPromise());
            manifest.misc = { ipfsHash: miscIpfsInfo.cid.toV0().toString() };
            // final manifest upload
            const manifestIpfsInfo = yield this.ipfs.add(JSON.stringify(manifest));
            return yield this.publish(name, manifest.def.version, tags || ['latest'], 'ipfs://' + manifestIpfsInfo.cid.toV0().toString());
        });
    }
}
exports.CannonRegistry = CannonRegistry;
