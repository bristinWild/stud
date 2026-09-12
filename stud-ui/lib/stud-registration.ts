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
    worldchainSepolia,
} from "viem/chains"

import {
    getEthereumProvider,
} from "@/lib/prediction-market"


const RPC_URL =
    process.env.RPC_URL ??
    "http://127.0.0.1:8545"


const STUD_REGISTRY =
    getAddress(
        process.env
            .STUD_REGISTRY_ADDRESS!
    )


const publicClient =
    createPublicClient({
        chain:
            worldchainSepolia,

        transport:
            http(
                RPC_URL
            ),
    })


const studRegistryAbi = [
    {
        type:
            "function",

        name:
            "registerStud",

        stateMutability:
            "nonpayable",

        inputs: [
            {
                name:
                    "nullifierHash",

                type:
                    "bytes32",
            },

            {
                name:
                    "deadline",

                type:
                    "uint256",
            },

            {
                name:
                    "signature",

                type:
                    "bytes",
            },
        ],

        outputs: [
            {
                name:
                    "studId",

                type:
                    "uint256",
            },
        ],
    },

    {
        type:
            "function",

        name:
            "isVerifiedStud",

        stateMutability:
            "view",

        inputs: [
            {
                name:
                    "wallet",

                type:
                    "address",
            },
        ],

        outputs: [
            {
                name:
                    "",

                type:
                    "bool",
            },
        ],
    },

    {
        type:
            "function",

        name:
            "getStudId",

        stateMutability:
            "view",

        inputs: [
            {
                name:
                    "wallet",

                type:
                    "address",
            },
        ],

        outputs: [
            {
                name:
                    "",

                type:
                    "uint256",
            },
        ],
    },
] as const


export type RegistrationAuthorization = {
    wallet: Address

    nullifierHash: Hex

    deadline: string

    signature: Hex

    signer: Address
}


export async function getStudRegistration(
    wallet: Address
) {
    const address =
        getAddress(
            wallet
        )

    const [
        verified,
        studId,
    ] =
        await Promise.all([
            publicClient
                .readContract({
                    address:
                        STUD_REGISTRY,

                    abi:
                        studRegistryAbi,

                    functionName:
                        "isVerifiedStud",

                    args: [
                        address,
                    ],
                }),

            publicClient
                .readContract({
                    address:
                        STUD_REGISTRY,

                    abi:
                        studRegistryAbi,

                    functionName:
                        "getStudId",

                    args: [
                        address,
                    ],
                }),
        ])

    return {
        verified,
        studId:
            Number(
                studId
            ),
    }
}


export async function registerStudOnchain(
    authorization:
        RegistrationAuthorization
) {
    const provider =
        await getEthereumProvider()

    const walletClient =
        createWalletClient({
            chain:
                worldchainSepolia,

            transport:
                custom(
                    provider
                ),
        })

    const [
        connectedAccount,
    ] =
        await walletClient
            .requestAddresses()

    if (
        !connectedAccount
    ) {
        throw new Error(
            "Connect your wallet first."
        )
    }


    const account =
        getAddress(
            connectedAccount
        )


    if (
        account !==
        getAddress(
            authorization.wallet
        )
    ) {
        throw new Error(
            "The connected wallet is different from the wallet that completed Selfie Check."
        )
    }


    const hash =
        await walletClient
            .writeContract({
                account,

                chain:
                    worldchainSepolia,

                address:
                    STUD_REGISTRY,

                abi:
                    studRegistryAbi,

                functionName:
                    "registerStud",

                args: [
                    authorization
                        .nullifierHash,

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
                hash,
            })


    if (
        receipt.status !==
        "success"
    ) {
        throw new Error(
            "Stud registration transaction reverted."
        )
    }


    const studId =
        await publicClient
            .readContract({
                address:
                    STUD_REGISTRY,

                abi:
                    studRegistryAbi,

                functionName:
                    "getStudId",

                args: [
                    account,
                ],
            })


    if (
        studId ===
        0n
    ) {
        throw new Error(
            "Registration succeeded but Stud ID was not found."
        )
    }


    return {
        hash,
        receipt,

        studId:
            Number(
                studId
            ),
    }
}