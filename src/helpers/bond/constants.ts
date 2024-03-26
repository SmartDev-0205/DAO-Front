import { Networks } from "../../constants/blockchain";

export enum BondType {
    StableAsset,
    LP,
}

export interface BondAddresses {
    reserveAddress: string;
    bondAddress: string;
}

export interface NetworkAddresses {
    [Networks.BSC_MAINNET]: BondAddresses;
    [Networks.BSC_TESTNET]: BondAddresses;
}
