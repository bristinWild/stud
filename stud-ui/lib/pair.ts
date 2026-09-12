import {
    createPublicClient,
    createWalletClient,
    custom,
    getAddress,
    http,
    type Address,
    type Hex,
} from "viem"

import {
    foundry,
} from "viem/chains"

import {
    getEthereumProvider,
} from "@/lib/prediction-market"

const RPC_URL =
    process.env
        .RPC_URL ??
    "http://127.0.0.1:8545"

const BACKEND_URL =
    process.env
        .BACKEND_URL ??
    "http://localhost:3001"

const PAIR_REGISTRY_ADDRESS =
    getAddress(
        process.env
            .PAIR_REGISTRY_ADDRESS!
    )

const publicClient =
    createPublicClient({
        chain: foundry,
        transport: http(
            RPC_URL
        ),
    })

const pairRegistryAbi = [
    {
        type: "function",
        name: "createPair",
        stateMutability:
            "nonpayable",
        inputs: [
            {
                name: "otherMember",
                type: "address",
            },
            {
                name: "deadline",
                type: "uint256",
            },
            {
                name: "signature",
                type: "bytes",
            },
        ],
        outputs: [
            {
                name: "pairId",
                type: "uint256",
            },
        ],
    },

    {
        type: "function",
        name: "getPairId",
        stateMutability:
            "view",
        inputs: [
            {
                name: "memberA",
                type: "address",
            },
            {
                name: "memberB",
                type: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
    },
] as const

type PairAuthorization = {
    memberA: Address
    memberB: Address
    deadline: string
    signature: Hex
    signer: Address
}

export async function createPairFromMatch(
    otherMember: Address
) {
    const provider =
        await getEthereumProvider()

    const chainId =
        await provider.request({
            method:
                "eth_chainId",
        })

    if (
        chainId !==
        "0x7a69"
    ) {
        throw new Error(
            "Switch MetaMask to Anvil Local."
        )
    }

    const walletClient =
        createWalletClient({
            chain: foundry,
            transport:
                custom(provider),
        })

    const [rawAccount] =
        await walletClient
            .requestAddresses()

    if (!rawAccount) {
        throw new Error(
            "Connect your Stud wallet first."
        )
    }

    const account =
        getAddress(
            rawAccount
        )

    const other =
        getAddress(
            otherMember
        )

    /*
     * Important for our current demo state:
     * Alice × Leo may already exist.
     */
    const existingPairId =
        await publicClient
            .readContract({
                address:
                    PAIR_REGISTRY_ADDRESS,

                abi:
                    pairRegistryAbi,

                functionName:
                    "getPairId",

                args: [
                    account,
                    other,
                ],
            })

    if (
        existingPairId >
        0n
    ) {
        return {
            pairId:
                existingPairId,

            alreadyExisted:
                true,

            transactionHash:
                null,
        }
    }

    /*
     * In production this endpoint will only
     * return authorization after the backend
     * detects an actual mutual match.
     *
     * For the hackathon demo we currently use
     * the existing dev authorization endpoint.
     */
    const authorizationResponse =
        await fetch(
            `${BACKEND_URL}/pairs/dev-authorization`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        memberA:
                            account,

                        memberB:
                            other,
                    }),
            }
        )

    if (
        !authorizationResponse.ok
    ) {
        const text =
            await authorizationResponse
                .text()

        throw new Error(
            text ||
            "Could not authorize Pair creation."
        )
    }

    const authorization:
        PairAuthorization =
        await authorizationResponse
            .json()

    const transactionHash =
        await walletClient
            .writeContract({
                account,
                chain:
                    foundry,

                address:
                    PAIR_REGISTRY_ADDRESS,

                abi:
                    pairRegistryAbi,

                functionName:
                    "createPair",

                args: [
                    other,
                    BigInt(
                        authorization
                            .deadline
                    ),
                    authorization
                        .signature,
                ],
            })

    const receipt =
        await publicClient
            .waitForTransactionReceipt({
                hash:
                    transactionHash,
            })

    if (
        receipt.status !==
        "success"
    ) {
        throw new Error(
            "Pair creation transaction reverted."
        )
    }

    const pairId =
        await publicClient
            .readContract({
                address:
                    PAIR_REGISTRY_ADDRESS,

                abi:
                    pairRegistryAbi,

                functionName:
                    "getPairId",

                args: [
                    account,
                    other,
                ],
            })

    if (
        pairId ===
        0n
    ) {
        throw new Error(
            "Pair transaction succeeded but Pair ID was not found."
        )
    }

    return {
        pairId,
        alreadyExisted:
            false,
        transactionHash,
    }
}