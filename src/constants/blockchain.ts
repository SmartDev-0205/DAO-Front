export const TOKEN_DECIMALS = 9;

export enum Networks {
    BSC_MAINNET = 56,
    BSC_TESTNET = 97,
}

type tNetworkNames = {
    [key: number]: string;
};

export const NETWORK_NAMES: tNetworkNames = {
    [Networks.BSC_MAINNET]: "BSC Mainnet",
    [Networks.BSC_TESTNET]: "BSC Testnet",
};

export const DEFAULT_NETWORKS = [Networks.BSC_TESTNET];
