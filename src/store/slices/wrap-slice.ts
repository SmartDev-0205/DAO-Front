import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { messages } from "../../constants/messages";
import { getAddresses, Networks } from "../../constants";
import { setAll, sleep } from "../../helpers";
import { info, success, warning } from "./messages-slice";
import { RootState } from "../store";
import { ethers } from "ethers";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { wNusdTokenContract } from "../../abi";
import { clearPendingTxn, fetchPendingTxns, getWrappingTypeText } from "./pending-txns-slice";
import { getGasPrice } from "../../helpers/get-gas-price";
import { fetchAccountSuccess, getBalances } from "./account-slice";

export interface IChangeApproval {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeApproval = createAsyncThunk("wrapping/changeApproval", async ({ provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const nusdContract = new ethers.Contract(addresses.NUSD_ADDRESS, wNusdTokenContract, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);

        approveTx = await nusdContract.approve(addresses.WNUSD_ADDRESS, ethers.constants.MaxUint256, { gasPrice });

        const text = "Approve Wrapping";
        const pendingTxnType = "approve_wrapping";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    const wnusdAllowance = await nusdContract.allowance(address, addresses.WNUSD_ADDRESS);

    return dispatch(
        fetchAccountSuccess({
            wrapping: {
                wnusd: Number(wnusdAllowance),
            },
        }),
    );
});

export interface IChangeWrap {
    isWrap: boolean;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeWrap = createAsyncThunk("wrapping/changeWrap", async ({ isWrap, value, provider, networkID, address }: IChangeWrap, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const amountInWei = isWrap ? ethers.utils.parseUnits(value, "ether") : ethers.utils.parseEther(value);
    const wnusdContract = new ethers.Contract(addresses.WNUSD_ADDRESS, wNusdTokenContract, signer);

    let wrapTx;

    try {
        const gasPrice = await getGasPrice(provider);

        if (isWrap) {
            wrapTx = await wnusdContract.wrap(amountInWei, { gasPrice });
        } else {
            wrapTx = await wnusdContract.unwrap(amountInWei, { gasPrice });
        }

        const pendingTxnType = isWrap ? "wrapping" : "unwrapping";
        dispatch(fetchPendingTxns({ txnHash: wrapTx.hash, text: getWrappingTypeText(isWrap), type: pendingTxnType }));
        await wrapTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (wrapTx) {
            dispatch(clearPendingTxn(wrapTx.hash));
        }
    }

    dispatch(info({ text: messages.your_balance_update_soon }));
    await sleep(10);
    await dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});

export interface IWrapDetails {
    isWrap: boolean;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

const calcWrapValue = async ({ isWrap, value, provider, networkID }: IWrapDetails): Promise<number> => {
    const addresses = getAddresses(networkID);

    const amountInWei = isWrap ? ethers.utils.parseUnits(value, "ether") : ethers.utils.parseEther(value);

    let wrapValue = 0;

    const wnusdContract = new ethers.Contract(addresses.WNUSD_ADDRESS, wNusdTokenContract, provider);

    if (isWrap) {
        const wnusdValue = await wnusdContract.NUSDTowNUSD(amountInWei);
        wrapValue = wnusdValue / Math.pow(10, 18);
    } else {
        const nusdValue = await wnusdContract.wNUSDToNUSD(amountInWei);
        wrapValue = nusdValue / Math.pow(10, 18);
    }

    return wrapValue;
};

export const calcWrapDetails = createAsyncThunk("wrapping/calcWrapDetails", async ({ isWrap, value, provider, networkID }: IWrapDetails, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    if (!value) {
        return new Promise<any>(resolve =>
            resolve({
                wrapValue: "",
            }),
        );
    }

    const wrapValue = await calcWrapValue({ isWrap, value, provider, networkID });

    return {
        wrapValue,
    };
});

export interface IWrapPrice {
    isWrap: boolean;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export const calcWrapPrice = createAsyncThunk("wrapping/calcWrapPrice", async ({ isWrap, provider, networkID }: IWrapPrice, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const wrapPrice = await calcWrapValue({ isWrap, value: "1", provider, networkID });

    return {
        wrapPrice,
    };
});

export interface IWrapSlice {
    loading: boolean;
    wrapValue: "";
    wrapPrice: number;
}

const initialState: IWrapSlice = {
    loading: true,
    wrapValue: "",
    wrapPrice: 0,
};

const wrapSlice = createSlice({
    name: "wrapping",
    initialState,
    reducers: {
        fetchWrapSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcWrapDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcWrapDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(calcWrapDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calcWrapPrice.pending, state => {
                state.loading = true;
            })
            .addCase(calcWrapPrice.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(calcWrapPrice.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default wrapSlice.reducer;

export const { fetchWrapSuccess } = wrapSlice.actions;

const baseInfo = (state: RootState) => state.wrapping;

export const getWrappingState = createSelector(baseInfo, wrapping => wrapping);
