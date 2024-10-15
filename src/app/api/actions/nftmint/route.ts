import { fetchCollection } from '@metaplex-foundation/mpl-core';
import { createNoopSigner, transactionBuilder, generateSigner, publicKey, signerIdentity, some } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { ActionPostResponse, ActionGetResponse, ActionPostRequest, createActionHeaders } from '@solana/actions';
import { clusterApiUrl, Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { mplCandyMachine as mplCoreCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox'

import { mintV1 } from "@metaplex-foundation/mpl-core-candy-machine";
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";

export const maxDuration = 300;

const headers = createActionHeaders({
    chainId: "mainnet", // or chainId: "devnet"
    actionVersion: "1.4.0", // the desired spec version
});

export const GET = async (req: Request) => {
    const requestUrl = new URL(req.url);

    const baseHref = new URL(
        `/api/actions/nftmint`,
        requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
        type: 'action',
        title: 'Solana Breakpoint 2024 Whisky - Only 150 available',
        icon: new URL('/Dramsky_Bottle WEBP 800x800.webp', new URL(req.url).origin).toString(),
        description: 'A collectible series of limited edition whisky bottles that honour iconic communities that have made Solana what it is today. Dramsky proudly brings to you a piece of Breakpoint within the vibrant city of Singapore.\n\n1NFT = 1 bottle of whisky\nPrice: 160 USDC \n\n• Redeem your whisky now! FREE DELIVERY for Breakpoint attendees within Singapore. Visit dramsky.io/redeem for full details.\n• Alternatively choose to hold or trade your NFT.\n\n Must be 18 years old and above to purchase.',
        label: 'Mint Now',
    };
    return Response.json(payload, {
        headers,
    });
};

export const OPTIONS = async () => {
    return new Response(null, { headers });
};

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();

        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers,
            });
        }
        /// DEVNET /////
        const connection = new Connection(
            clusterApiUrl('mainnet-beta'),
        );

        // Setup Umi
        const umi = createUmi(process.env.NEXT_PUBLIC_SOLANA_RPC!).use(mplCoreCandyMachine());

        const collectionPK = publicKey(process.env.COLLECTION_PK!);
        const candyMachineId = publicKey(process.env.CANDY_MACHINE_ID!);
        const tokenMintPK = publicKey(process.env.TOKEN_MINT!)

        umi.use(signerIdentity(createNoopSigner(publicKey(account))));

        const asset = generateSigner(umi);
        const destinationAta = findAssociatedTokenPda(umi, {
            mint: tokenMintPK,
            owner: publicKey(process.env.PAYMENT_WALLET_PK!),
        })

        console.log("destinationAta", destinationAta);
        // const usdcBalance = await connection.getTokenAccountBalance(usdcWallet[0]);
        // if (usdcBalance.value.uiAmount === null || usdcBalance.value.uiAmount < 160) {
        //     return new Response("Insufficient USDC balance", {
        //         status: 400,
        //         headers,
        //     });
        // }

        // construct the transaction
        const tx = await transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(setComputeUnitPrice(umi, { microLamports: 10000 })) // Set the price per Compute Unit in micro-lamports.
            .add(
                mintV1(umi, {
                    candyMachine: candyMachineId,
                    asset,
                    collection: collectionPK,
                    mintArgs: {
                        tokenPayment: some({
                            amount: 160_000_000,
                            mint: tokenMintPK,
                            destinationAta: destinationAta[0]
                        }),
                    },
                })).buildAndSign(umi);

        // serialize the transaction
        const transaction = umi.transactions.serialize(tx)

        // simulate the transaction and turn it into a versioned transaction
        const deserializedTx = VersionedTransaction.deserialize(transaction);
        const simulation = await connection.simulateTransaction(deserializedTx);
        console.log("simulation", simulation);

        const payload: ActionPostResponse = {
            transaction: Buffer.from(transaction).toString("base64"),
            message: "Dramsky Whisky NFT Minted Successfully"
        };

        return Response.json(payload, {
            headers,
        })

    } catch (err) {
        console.log(err);
        let message = 'An unknown error occurred';
        if (typeof err == 'string') message = err;
        return new Response(message, {
            status: 400,
            headers,
        });
    }
};


