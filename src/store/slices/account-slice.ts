import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { NmetaTokenContract, NusdTokenContract, BusdTokenContract, wNusdTokenContract } from "../../abi";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import React from "react";
import { RootState } from "../store";
import { IToken } from "../../helpers/tokens";

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IAccountBalances {
    balances: {
        nusd: string;
        nmeta: string;
        wnusd: string;
    };
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID);

    const nusdContract = new ethers.Contract(addresses.NUSD_ADDRESS, NusdTokenContract, provider);
    const nusdBalance = await nusdContract.balanceOf(address);
    const nmetaContract = new ethers.Contract(addresses.NMETA_ADDRESS, NmetaTokenContract, provider);
    const nmetaBalance = await nmetaContract.balanceOf(address);
    const wnusdContract = new ethers.Contract(addresses.WNUSD_ADDRESS, wNusdTokenContract, provider);
    const wnusdBalance = await wnusdContract.balanceOf(address);

    return {
        balances: {
            nusd: ethers.utils.formatUnits(nusdBalance, "ether"),
            nmeta: ethers.utils.formatUnits(nmetaBalance, "ether"),
            wnusd: ethers.utils.formatEther(wnusdBalance),
        },
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        nmeta: string;
        nusd: string;
        wnusd: string;
    };
    staking: {
        nmeta: number;
        nusd: number;
    };
    wrapping: {
        nusd: number;
    };
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let nmetaBalance = 0;
    let nusdBalance = 0;

    let wnusdBalance = 0;
    let nusdWnusdAllowance = 0;

    let stakeAllowance = 0;
    let unstakeAllowance = 0;

    const addresses = getAddresses(networkID);

    if (addresses.NMETA_ADDRESS) {
        const nmetaContract = new ethers.Contract(addresses.NMETA_ADDRESS, NmetaTokenContract, provider);
        nmetaBalance = await nmetaContract.balanceOf(address);
        stakeAllowance = await nmetaContract.allowance(address, addresses.STAKING_HELPER_ADDRESS);
    }

    if (addresses.NUSD_ADDRESS) {
        const nusdContract = new ethers.Contract(addresses.NUSD_ADDRESS, NusdTokenContract, provider);
        nusdBalance = await nusdContract.balanceOf(address);
        unstakeAllowance = await nusdContract.allowance(address, addresses.STAKING_ADDRESS);

        if (addresses.WNUSD_ADDRESS) {
            nusdWnusdAllowance = await nusdContract.allowance(address, addresses.WNUSD_ADDRESS);
        }
    }

    if (addresses.WNUSD_ADDRESS) {
        const wnusdContract = new ethers.Contract(addresses.WNUSD_ADDRESS, wNusdTokenContract, provider);
        wnusdBalance = await wnusdContract.balanceOf(address);
    }

    return {
        balances: {
            nusd: ethers.utils.formatUnits(nusdBalance, "ether"),
            nmeta: ethers.utils.formatUnits(nmetaBalance, "ether"),
            wnusd: ethers.utils.formatEther(wnusdBalance),
        },
        staking: {
            nmeta: Number(stakeAllowance),
            nusd: Number(unstakeAllowance),
        },
        wrapping: {
            nusd: Number(nusdWnusdAllowance),
        },
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    bnbBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("account/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                bnbBalance: 0,
            });
        });
    }

    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 18);
    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastTime);
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatEther(balance);

    const bnbBalance = await provider.getSigner().getBalance();
    const bnbVal = ethers.utils.formatEther(bnbBalance);

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, "gwei");

    return {
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        bnbBalance: Number(bnbVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: Number(pendingPayoutVal),
    };
});

interface ICalcUserTokenDetails {
    address: string;
    token: IToken;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserTokenDetails {
    allowance: number;
    balance: number;
    isBnb?: boolean;
}

export const calculateUserTokenDetails = createAsyncThunk("account/calculateUserTokenDetails", async ({ address, token, networkID, provider }: ICalcUserTokenDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                token: "",
                address: "",
                img: "",
                allowance: 0,
                balance: 0,
            });
        });
    }

    if (token.isBnb) {
        const bnbBalance = await provider.getSigner().getBalance();
        const bnbVal = ethers.utils.formatEther(bnbBalance);

        return {
            token: token.name,
            tokenIcon: token.img,
            balance: Number(bnbVal),
            isBnb: true,
        };
    }

    const addresses = getAddresses(networkID);

    const tokenContract = new ethers.Contract(token.address[networkID], BusdTokenContract, provider);

    let allowance,
        balance = "0";

    allowance = await tokenContract.allowance(address, addresses.ZAPIN_ADDRESS);
    balance = await tokenContract.balanceOf(address);

    const balanceVal = Number(balance) / Math.pow(10, token.decimals);

    return {
        token: token.name,
        address: token.address,
        img: token.img,
        allowance: Number(allowance),
        balance: Number(balanceVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        nusd: string;
        nmeta: string;
        wnusd: string;
    };
    loading: boolean;
    staking: {
        nmeta: number;
        nusd: number;
    };
    wrapping: {
        nusd: number;
    };
    tokens: { [key: string]: IUserTokenDetails };
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { nusd: "", nmeta: "", wnusd: "" },
    staking: { nmeta: 0, nusd: 0 },
    wrapping: { nusd: 0 },
    tokens: {},
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserTokenDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserTokenDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const token = action.payload.token;
                state.tokens[token] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserTokenDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
