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
        [Networks.BSC_TESTNET]: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
    },
    img: BusdIcon,
    decimals: 18,
};

const nmeta: IToken = {
    name: "NMETA",
    address: {
        [Networks.BSC_MAINNET]: "0x9716F8F7dC5EC6A3309B336b93E3B9393B011523",
        [Networks.BSC_TESTNET]: "0xe599CBaA7f560E2B50Ba7a12A76E27334b7e979C",
    },
    img: NmetaIcon,
    decimals: 18,
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
