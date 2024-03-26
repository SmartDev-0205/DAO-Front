import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import BusdIcon from "../../assets/tokens/BUSD.png";
import BnbIcon from "../../assets/tokens/BNB.png";
import BusdNmetaIcon from "../../assets/tokens/NMETA-BUSD.png";
import BnbNmetaIcon from "../../assets/tokens/NMETA-BNB.png";

import { StableBondContract, LpBondContract, CustomContract, StableReserveContract, LpReserveContract } from "../../abi";

export const busd = new StableBond({
    name: "busd",
    displayName: "BUSD",
    bondToken: "BUSD",
    bondIconSvg: BusdIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.BSC_MAINNET]: {
            bondAddress: "0x7bfEcC0B2C730A03c3b89F07493393E5EB589eE8",
            reserveAddress: "0xffa3B19EDAe07A458120a91408cC00917aedF607",
        },
        [Networks.BSC_TESTNET]: {
            bondAddress: "0x2A40A8Daf771a1ea73073604139aA964113b6603",
            reserveAddress: "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
        },
    },
    tokensInStrategy: "0",
});

export const wbnb = new CustomBond({
    name: "wbnb",
    displayName: "BNB",
    bondToken: "BNB",
    bondIconSvg: BnbIcon,
    bondContractABI: CustomContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.BSC_MAINNET]: {
            bondAddress: "0x962Bf359b4bE7f3847a0c6449c91BEfc33d6E7FB",
            reserveAddress: "0xd00ae08403b9bbb9124bb305c09058e32c39a48c",
        },
        [Networks.BSC_TESTNET]: {
            bondAddress: "0x19255821a1cc66C199B2c474696B265741e30566",
            reserveAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        },
    },
    tokensInStrategy: "0",
});

export const busdNmeta = new LPBond({
    name: "busd_nmeta_lp",
    displayName: "NMETA-BUSD LP",
    bondToken: "BUSD",
    bondIconSvg: BusdNmetaIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.BSC_MAINNET]: {
            bondAddress: "0x77408Fa7d8f58292611b95CB32ADfB7C84642654",
            reserveAddress: "0x60ccc9efee8fe4326fe99976f48522e2e0b66d67",
        },
        [Networks.BSC_TESTNET]: {
            bondAddress: "0x18062A1988CBAD3D421552EB1C401e902AD0f195",
            reserveAddress: "0x9a256121528DC09207A8080e4c68103407f9CBCA",
        },
    },
    lpUrl: {
        [Networks.BSC_MAINNET]: "https://pancakeswap.finance/add/0xC8B7F8eEC1dB0Fd16054C9f9F0203e988b96FBaE/0x9716F8F7dC5EC6A3309B336b93E3B9393B011523",
        [Networks.BSC_TESTNET]: "https://pancake.kiemtienonline360.com/#/add/0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7/0xe599CBaA7f560E2B50Ba7a12A76E27334b7e979C",
    },
});

export const bnbNmeta = new CustomLPBond({
    name: "bnb_nmeta_lp",
    displayName: "NMETA-BNB LP",
    bondToken: "BNB",
    bondIconSvg: BnbNmetaIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.BSC_MAINNET]: {
            bondAddress: "0xE9BE1ce600879e29A8F10d84d91766F14Bb9C02d",
            reserveAddress: "0x96c33729a7819387c459cba3682266c21a117966",
        },
        [Networks.BSC_TESTNET]: {
            bondAddress: "0x0eeF6aa30e935c80c32527f96850a3A7D7756B0D",
            reserveAddress: "0x465155142C62A7A26060Ae7802966612a55a7748",
        },
    },
    lpUrl: {
        [Networks.BSC_MAINNET]: "https://pancakeswap.finance/add/0x2935b9B3915Af8063CF87d4d0179e2A0d89413FE/0x9716F8F7dC5EC6A3309B336b93E3B9393B011523",
        [Networks.BSC_TESTNET]: "https://pancake.kiemtienonline360.com/#/add/BNB/0xe599CBaA7f560E2B50Ba7a12A76E27334b7e979C",
    },
});

export default [busd, wbnb, busdNmeta, bnbNmeta];
