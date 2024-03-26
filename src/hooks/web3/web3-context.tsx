import React, { useState, ReactElement, useContext, useMemo, useCallback } from "react";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getBscMainnetURI, getBscTestnetURI } from "./helpers";
import { DEFAULT_NETWORKS } from "../../constants";
import { Networks } from "../../constants";
import { messages } from "../../constants/messages";
import { useDispatch } from "react-redux";
import { swithNetwork } from "../../helpers/switch-network";

type tNetworkRpcs = {
    [key: number]: string;
};

const NETWORK_RPCS: tNetworkRpcs = {
    [Networks.BSC_MAINNET]: getBscMainnetURI(),
    [Networks.BSC_TESTNET]: getBscTestnetURI(),
};

type onChainProvider = {
    connect: () => Promise<Web3Provider>;
    disconnect: () => void;
    checkWrongNetwork: () => Promise<boolean>;
    provider: JsonRpcProvider;
    address: string;
    connected: Boolean;
    web3Modal: Web3Modal;
    chainID: number;
    web3?: any;
    providerChainID: number;
    hasCachedProvider: () => boolean;
};

export type Web3ContextData = {
    onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
    const web3Context = useContext(Web3Context);
    if (!web3Context) {
        throw new Error("useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.");
    }
    const { onChainProvider } = web3Context;
    return useMemo(() => {
        return { ...onChainProvider };
    }, [web3Context]);
};

export const useAddress = () => {
    const { address } = useWeb3Context();
    return address;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const dispatch = useDispatch();
    let defaultNetworkId = parseInt(window.localStorage.getItem("defaultNetworkId") || DEFAULT_NETWORKS[0].toString());
    defaultNetworkId = DEFAULT_NETWORKS.indexOf(defaultNetworkId) === -1 ? DEFAULT_NETWORKS[0] : defaultNetworkId;

    const [connected, setConnected] = useState(false);
    const [chainID, setChainID] = useState(defaultNetworkId);
    const [providerChainID, setProviderChainID] = useState(defaultNetworkId);
    const [address, setAddress] = useState("");

    const [web3Modal] = useState<Web3Modal>(
        new Web3Modal({
            cacheProvider: true,
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        rpc: {
                            [Networks.BSC_MAINNET]: getBscMainnetURI(),
                            [Networks.BSC_TESTNET]: getBscTestnetURI(),
                        },
                    },
                },
            },
        }),
    );

    const [uri, setUri] = useState(NETWORK_RPCS[chainID]);
    const [provider, setProvider] = useState<JsonRpcProvider>(new StaticJsonRpcProvider(uri));

    const hasCachedProvider = (): boolean => {
        if (!web3Modal) return false;
        if (!web3Modal.cachedProvider) return false;
        return true;
    };

    const _initListeners = useCallback(
        (rawProvider: JsonRpcProvider) => {
            if (!rawProvider.on) {
                return;
            }

            rawProvider.on("accountsChanged", () => setTimeout(() => window.location.reload(), 1));

            rawProvider.on("chainChanged", async (chain: number) => {
                changeNetwork(chain);
            });

            rawProvider.on("network", (_newNetwork, oldNetwork) => {
                if (!oldNetwork) return;
                window.location.reload();
            });
        },
        [provider],
    );

    const changeNetwork = async (otherChainID: number) => {
        const network = Number(otherChainID);

        setProviderChainID(network);
        const result = await checkWrongNetwork();
        if (!result) {
            window.localStorage.setItem("defaultNetworkId", otherChainID.toString());
            window.location.reload();
        } else {
            await web3Modal.clearCachedProvider();
        }
    };

    const connect = useCallback(async () => {
        const rawProvider = await web3Modal.connect();

        _initListeners(rawProvider);

        const connectedProvider = new Web3Provider(rawProvider, "any");

        const chainId = await connectedProvider.getNetwork().then(network => Number(network.chainId));
        const connectedAddress = await connectedProvider.getSigner().getAddress();

        setAddress(connectedAddress);

        setProviderChainID(chainId);

        if (DEFAULT_NETWORKS.indexOf(chainId) === -1) {
            const shouldSwitch = window.confirm(messages.switch_to_mainnet[defaultNetworkId]);
            if (shouldSwitch) {
                await swithNetwork(defaultNetworkId);
                window.location.reload();
            } else {
                await web3Modal.clearCachedProvider();
                window.location.reload();
            }
        } else if (chainID !== chainId) {
            window.localStorage.setItem("defaultNetworkId", chainId.toString());
            window.location.reload();
        }

        setProvider(connectedProvider);

        setConnected(true);

        return connectedProvider;
    }, [provider, web3Modal, connected]);

    const checkWrongNetwork = async (): Promise<boolean> => {
        if (DEFAULT_NETWORKS.indexOf(providerChainID) === -1) {
            const shouldSwitch = window.confirm(messages.switch_to_mainnet[defaultNetworkId]);
            if (shouldSwitch) {
                await swithNetwork(defaultNetworkId);
                window.location.reload();
            }
            return true;
        }

        return false;
    };

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
        setConnected(false);

        setTimeout(() => {
            window.location.reload();
        }, 1);
    }, [provider, web3Modal, connected]);

    const onChainProvider = useMemo(
        () => ({
            connect,
            disconnect,
            hasCachedProvider,
            provider,
            connected,
            address,
            chainID,
            web3Modal,
            providerChainID,
            checkWrongNetwork,
        }),
        [connect, disconnect, hasCachedProvider, provider, connected, address, chainID, web3Modal, providerChainID],
    );
    //@ts-ignore
    return <Web3Context.Provider value={{ onChainProvider }}>{children}</Web3Context.Provider>;
};
