/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        inputs: [],
        name: "NoChange",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "NotNominated",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address",
            },
        ],
        name: "Unauthorized",
        type: "error",
    },
    {
        inputs: [],
        name: "ZeroAddress",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "oldOwner",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnerChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnerNominated",
        type: "event",
    },
    {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newNominatedOwner",
                type: "address",
            },
        ],
        name: "nominateNewOwner",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "nominatedOwner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceNomination",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x608060405234801561001057600080fd5b50610754806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80631627540c1461005c57806353a47bb714610078578063718fe9281461009657806379ba5097146100a05780638da5cb5b146100aa575b600080fd5b6100766004803603810190610071919061069e565b6100c8565b005b61008061028d565b60405161008d91906106da565b60405180910390f35b61009e6102c0565b005b6100a86103a7565b005b6100b2610534565b6040516100bf91906106da565b60405180910390f35b60006100d2610567565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146101115761011061059a565b5b600061011b610613565b9050600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610184576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561020e576040517fa88ee57700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b828160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f906a1c6bd7e3091ea86693dd029a831c19049ce77f1dce2ce0bab1cacbabce228360405161028091906106da565b60405180910390a1505050565b6000610297610613565b60010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60006102ca610613565b90503373ffffffffffffffffffffffffffffffffffffffff168160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461036057336040517fa0e5a0d700000000000000000000000000000000000000000000000000000000815260040161035791906106da565b60405180910390fd5b60008160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60006103b1610613565b905060008160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461044c57336040517fa0e5a0d700000000000000000000000000000000000000000000000000000000815260040161044391906106da565b60405180910390fd5b7fb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c8260000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16826040516104a19291906106f5565b60405180910390a1808260000160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008260010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b600061053e610613565b60000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000610571610613565b60000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6105a2610567565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461061157336040517f8e4a23d600000000000000000000000000000000000000000000000000000000815260040161060891906106da565b60405180910390fd5b565b60007f66d20a9eef910d2df763b9de0d390f3cc67f7d52c6475118cd57fa98be8cf6cb905090565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061066b82610640565b9050919050565b61067b81610660565b811461068657600080fd5b50565b60008135905061069881610672565b92915050565b6000602082840312156106b4576106b361063b565b5b60006106c284828501610689565b91505092915050565b6106d481610660565b82525050565b60006020820190506106ef60008301846106cb565b92915050565b600060408201905061070a60008301856106cb565b61071760208301846106cb565b939250505056fea264697066735822122014f74b7cc811f9ca8f9932d663784a7311e659500af28ecca4ee4d9617dd005664736f6c634300080b0033";
const isSuperArgs = (xs) => xs.length > 1;
export class Ownable__factory extends ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
Ownable__factory.bytecode = _bytecode;
Ownable__factory.abi = _abi;
