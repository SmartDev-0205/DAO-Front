import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=binance-usd,binancecoin&vs_currencies=usd";
    const { data } = await axios.get(url);

    cache["BUSD"] = data["binance-usd"].usd;
    cache["BNB"] = data["binancecoin"].usd;
};

export const getTokenPrice = (symbol: string): number => {
    if (Object.keys(cache).length === 0) {
        cache["BUSD"] = 1;
        cache["BNB"] = 274;
    }
    return Number(cache[symbol]);
};
