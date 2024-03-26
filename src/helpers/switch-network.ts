import { Networks } from "../constants/blockchain";

const switchRequest = (chainId: number) => {
    return window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }],
    });
};

const addChainRequest = () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainId: "0x38",
                chainName: "Binance Smart Chain Mainnet",
                rpcUrls: ["https://bsc-dataseed1.binance.org"],
                blockExplorerUrls: ["https://bscscan.com"],
                nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 8,
                },
            },
            {
                chainId: "0x61",
                chainName: "Binance Smart Chain Testnet",
                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
                blockExplorerUrls: ["https://testnet.bscscan.com"],
                nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 8,
                },
            },
        ],
    });
};

export const swithNetwork = async (chainId: number) => {
    if (window.ethereum) {
        try {
            await switchRequest(chainId);
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await addChainRequest();
                    await switchRequest(chainId);
                } catch (addError) {
                    console.log(error);
                }
            }
            console.log(error);
            return false;
        }
        return true;
    }
    return false;
};
