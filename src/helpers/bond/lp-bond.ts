import { ContractInterface } from "ethers";
import { Bond, BondOpts, tLpUrl } from "./bond";
import { BondType } from "./constants";
import { Networks } from "../../constants/blockchain";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getBondCalculator } from "../bond-calculator";
import { getAddresses } from "../../constants/addresses";

// Keep all LP specific fields/logic within the LPBond class
export interface LPBondOpts extends BondOpts {
    readonly reserveContractAbi: ContractInterface;
    readonly lpUrl: tLpUrl;
}

export class LPBond extends Bond {
    readonly isLP = true;
    readonly lpUrl: tLpUrl;
    readonly reserveContractAbi: ContractInterface;
    readonly displayUnits: string;

    constructor(lpBondOpts: LPBondOpts) {
        super(BondType.LP, lpBondOpts);

        this.lpUrl = lpBondOpts.lpUrl;
        this.reserveContractAbi = lpBondOpts.reserveContractAbi;
        this.displayUnits = "LP";
    }

    async getTreasuryBalance(networkID: Networks, provider: StaticJsonRpcProvider) {
        const addresses = getAddresses(networkID);

        const token = this.getContractForReserve(networkID, provider);
        const tokenAddress = this.getAddressForReserve(networkID);
        const bondCalculator = getBondCalculator(networkID, provider);
        const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
        const valuation = await bondCalculator.valuation(tokenAddress, tokenAmount);
        const markdown = await bondCalculator.markdown(tokenAddress);
        const tokenUSD = (valuation / Math.pow(10, 18)) * (markdown / Math.pow(10, 18));

        return tokenUSD;
    }

    public getTokenAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return this.getReserves(networkID, provider, true);
    }

    public getNmetaAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return this.getReserves(networkID, provider, false);
    }

    private async getReserves(networkID: Networks, provider: StaticJsonRpcProvider, isToken: boolean): Promise<number> {
        const addresses = getAddresses(networkID);

        const token = this.getContractForReserve(networkID, provider);

        let [reserve0, reserve1] = await token.getReserves();
        const token1: string = await token.token1();
        const iNusd = token1.toLowerCase() === addresses.NMETA_ADDRESS.toLowerCase();

        return isToken ? this.toTokenDecimal(false, iNusd ? reserve0 : reserve1) : this.toTokenDecimal(true, iNusd ? reserve1 : reserve0);
    }

    private toTokenDecimal(iNusd: boolean, reserve: number) {
        return iNusd ? reserve / Math.pow(10, 18) : reserve / Math.pow(10, 18);
    }
}

// These are special bonds that have different valuation methods
export interface CustomLPBondOpts extends LPBondOpts {}

export class CustomLPBond extends LPBond {
    constructor(customBondOpts: CustomLPBondOpts) {
        super(customBondOpts);

        this.getTreasuryBalance = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const tokenAmount = await super.getTreasuryBalance(networkID, provider);
            const tokenPrice = this.getTokenPrice();

            return tokenAmount * tokenPrice;
        };

        this.getTokenAmount = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const tokenAmount = await super.getTokenAmount(networkID, provider);
            const tokenPrice = this.getTokenPrice();

            return tokenAmount * tokenPrice;
        };
    }
}
