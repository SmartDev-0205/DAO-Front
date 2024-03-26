import { Box } from "@material-ui/core";
import { Bond } from "../helpers/bond/bond";

interface IBondLogoProps {
    bond: Bond;
}

function BondLogo({ bond }: IBondLogoProps) {
    let style = { height: "32px", width: "32px" };

    if (bond.isLP) {
        style = { height: "30px", width: "62px" };
    }

    return (
        <div className="d-flex align-items-center justify-content-center w-16">
            <img src={bond.bondIconSvg} style={style} />
        </div>
    );
}

export default BondLogo;
