import {Hono} from "https://deno.land/x/hono@v3.12.11/mod.ts";
import {TokenMetadata} from "npm:@solana/spl-token-metadata";

const app = new Hono();

app.get("/", (c) =>
    c.json([
        "/metadata?name=USDc&symbol=USDC&mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&metadata=decimals:6,chainId:101",
        ...opos.map((type) => `/opos?type=${type}`),
    ]));

app.get("/metadata", (c) => {
    const url = new URL(c.req.url);
    const baseUrl = url.origin + url.pathname;

    const name = c.req.query("name") ?? "Default Name";
    const symbol = c.req.query("symbol") ?? "DEFAULT";
    const mint = c.req.query("mint") ??
        "FEESx3igs4u1p4kh4eBmRwoVYujxgXDsVv5Hy5GDNpXD";

    const metadataStr = c.req.query("metadata") ?? "";
    const metadataParts = metadataStr.includes(",")
        ? metadataStr.split(",")
        : [metadataStr];
    const additionalMetadata: [string, string][] = metadataParts.map(
        (part: string) => {
            const [key, value] = part.split(":");
            return [key, value];
        },
    );

    const uri = `${baseUrl}?name=${encodeURIComponent(name)}&symbol=${
        encodeURIComponent(symbol)
    }&mint=${encodeURI(mint)}&metadata=${encodeURIComponent(metadataStr)}`;

    const result: Omit<TokenMetadata, "mint"> & { mint: string } = {
        name,
        symbol,
        mint,
        uri,
        additionalMetadata: additionalMetadata ?? [],
    };

    return c.json(result);
});

const opos = [
    "Climate",
    "ClosedCube",
    "CompressedCoil",
    "CompressedNFT",
    "Consensus",
    "DeveloperPortal",
    "DeveloperToolkit",
    "GlobalPayments",
    "OpenCube",
    "ParallelTransactions",
    "SagaPhone",
    "Security",
];
app.get("/opos", (c) => {
    const type = c.req.query("type") ?? "Climate";
    if (type !== 'all' && !opos.includes(type)) {
        return c.json({error: "Invalid type"}, 400);
    }
    if (type === 'all') {
        return c.json(opos.map((type) => getResult(type)));
    }

    return c.json(getResult(type));
});

Deno.serve(app.fetch);


function getResult(type: string) {
    return {
        name: `OPOS ${type} Token`,
        symbol: "OPOS",
        description: "Only Possible On Solana",
        image:
            `https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/${type}/image.png`,
        attributes: [
            {
                trait_type: "Item",
                value: type,
            },
        ],
    };
}
