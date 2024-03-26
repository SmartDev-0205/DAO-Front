import BnbIcon from "../assets/tokens/BNB.png";
import BusdIcon from "../assets/tokens/BUSD.png";
import NmetaIcon from "../assets/tokens/NMETA.png";
import { Networks } from "src/constants";

type tTokenAddress = {
    [key: number]: string;
};

export interface IToken {
    name: string;
    address: tTokenAddress;
    img: string;
    isBnb?: boolean;
    decimals: number;
}

export const busd: IToken = {
    name: "BUSD",
    address: {
        [Networks.BSC_MAINNET]: "0xC8B7F8eEC1dB0Fd16054C9f9F0203e988b96FBaE",
        [Networks.BSC_TESTNET]: "0xab1a4d4f1d656d2450692d237fdd6c7f9146e814",
    },
    img: BusdIcon,
    decimals: 18,
};

const nmeta: IToken = {
    name: "NMETA",
    address: {
        [Networks.BSC_MAINNET]: "0x9716F8F7dC5EC6A3309B336b93E3B9393B011523",
        [Networks.BSC_TESTNET]: "0x5467B4d0aC87c7eE5d030AdcFb25cFe4Be87aA77",
    },
    img: NmetaIcon,
    decimals: 8,
};

export const bnb: IToken = {
    name: "BNB",
    address: {
        [Networks.BSC_MAINNET]: "0x2935b9B3915Af8063CF87d4d0179e2A0d89413FE",
        [Networks.BSC_TESTNET]: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    },
    img: BnbIcon,
    decimals: 18,
};

export default [busd, nmeta, bnb];
