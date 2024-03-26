import NmetaImg from "../assets/tokens/NMETA.png";
import NusdImg from "../assets/tokens/NUSD.png";

function toUrl(tokenPath: string): string {
    const host = window.location.origin;
    return `${host}/${tokenPath}`;
}

export function getTokenUrl(name: string) {
    if (name === "nmeta") {
        return toUrl(NmetaImg);
    }

    if (name === "nusd") {
        return toUrl(NusdImg);
    }

    throw Error(`Token url doesn't support: ${name}`);
}
