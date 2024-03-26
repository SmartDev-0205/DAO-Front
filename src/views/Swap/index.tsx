import { useSelector } from "react-redux";
import { IReduxState } from "../../store/slices/state.interface";
import { getAddresses } from "../../constants";
import { useWeb3Context } from "../../hooks";
import "./swap.scss";

function Swap() {
    const { chainID } = useWeb3Context();

    const networkID = useSelector<IReduxState, number>(state => {
        return (state.app && state.app.networkID) || chainID;
    });

    const addresses = getAddresses(networkID);

    const NMETA_ADDRESS = addresses.NMETA_ADDRESS;

    return (
        <div className="swap-view">
            <div className="swap-top"></div>
            <iframe src={`https://app.bogged.finance/bsc/swap?tokenIn=BNB&tokenOut=0xfac45d4b406D94cddFC48b198839673351CB2Bf9&embed=1`}></iframe>
        </div>
    );
}

export default Swap;
