import { useState } from "react";
import { getAddresses, TOKEN_DECIMALS, DEFAULT_NETWORKS } from "../../../constants";
import { useSelector } from "react-redux";
import { Link, Fade, Popper } from "@material-ui/core";
import "./token-menu.scss";
import { IReduxState } from "../../../store/slices/state.interface";
import { getTokenUrl } from "../../../helpers";
import { useWeb3Context } from "../../../hooks";

const addTokenToWallet = (tokenSymbol: string, tokenAddress: string) => async () => {
    const tokenImage = getTokenUrl(tokenSymbol.toLowerCase());

    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: TOKEN_DECIMALS,
                        image: tokenImage,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }
};

function TokenMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;
    const { chainID } = useWeb3Context();

    const networkID = useSelector<IReduxState, number>(state => {
        return (state.app && state.app.networkID) || chainID;
    });

    const addresses = getAddresses(networkID);

    const NUSD_ADDRESS = addresses.NUSD_ADDRESS;
    const NMETA_ADDRESS = addresses.NMETA_ADDRESS;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);

    return (
        <div className="token-menu-root" onMouseEnter={e => handleClick(e)} onMouseLeave={e => handleClick(e)}>
            <div className="token-menu-btn">
                <p>NMETA</p>
            </div>

            <Popper className="token-menu-popper" open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <div className="tooltip">
                            <Link className="tooltip-item" href={`https://pancake.kiemtienonline360.com/#/swap?inputCurrency=&outputCurrency=${NMETA_ADDRESS}`} target="_blank">
                                <p>Buy on PancakeSwap</p>
                            </Link>

                            {isEthereumAPIAvailable && (
                                <div className="add-tokens">
                                    <div className="divider" />
                                    <p className="add-tokens-title">ADD TOKEN TO WALLET</p>
                                    <div className="divider" />
                                    <div className="tooltip-item" onClick={addTokenToWallet("NMETA", NMETA_ADDRESS)}>
                                        <p>NMETA</p>
                                    </div>
                                    <div className="tooltip-item" onClick={addTokenToWallet("NUSD", NUSD_ADDRESS)}>
                                        <p>NUSD</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}

export default TokenMenu;
