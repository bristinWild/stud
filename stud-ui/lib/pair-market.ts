import {
    createPublicClient,
    createWalletClient,
    custom,
    formatUnits,
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
        .NEXT_PUBLIC_RPC_URL ??
    "http://127.0.0.1:8545"

const PAIR_MARKET_FACTORY_ADDRESS =
    getAddress(
        process.env
            .NEXT_PUBLIC_PAIR_MARKET_FACTORY_ADDRESS!
    )

const publicClient =
    createPublicClient({
        chain: foundry,
        transport: http(
            RPC_URL
        ),
    })

const TOKEN_UNIT =
    10n ** 18n

const erc20Abi = [
    {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [
            {
                name: "account",
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
    {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "spender",
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
    {
        type: "function",
        name: "approve",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "spender",
                type: "address",
            },
            {
                name: "amount",
                type: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
    },
] as const

const pairMarketAbi = [
    {
        type: "function",
        name: "quoteBuy",
        stateMutability: "view",
        inputs: [
            {
                name: "tokenAmount",
                type: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        type: "function",
        name: "quoteSell",
        stateMutability: "view",
        inputs: [
            {
                name: "tokenAmount",
                type: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
    },
    {
        type: "function",
        name: "buy",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "tokenAmount",
                type: "uint256",
            },
            {
                name: "maxQuoteAmount",
                type: "uint256",
            },
        ],
        outputs: [],
    },
    {
        type: "function",
        name: "sell",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "tokenAmount",
                type: "uint256",
            },
            {
                name: "minQuoteAmount",
                type: "uint256",
            },
        ],
        outputs: [],
    },
] as const

const pairMarketFactoryAbi = [
    {
        type: "function",
        name: "createMarket",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "pairId",
                type: "uint256",
            },
            {
                name: "tokenName",
                type: "string",
            },
            {
                name: "tokenSymbol",
                type: "string",
            },
            {
                name: "deadline",
                type: "uint256",
            },
            {
                name: "counterpartySignature",
                type: "bytes",
            },
        ],
        outputs: [
            {
                name: "marketAddress",
                type: "address",
            },
        ],
    },
] as const

async function getWallet() {
    const provider =
        await getEthereumProvider()

    const chainId =
        await provider.request({
            method: "eth_chainId",
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
            "Connect your wallet first."
        )
    }

    return {
        walletClient,
        account:
            getAddress(
                rawAccount
            ),
    }
}

function parseWholeTokens(
    amount: string
) {
    if (
        !/^[1-9]\d*$/.test(
            amount
        )
    ) {
        throw new Error(
            "Pair Tokens must be whole numbers."
        )
    }

    return (
        BigInt(amount) *
        TOKEN_UNIT
    )
}

export async function getPairTokenBalance(
    pairTokenAddress: Address,
    walletAddress: Address
) {
    const balance =
        await publicClient
            .readContract({
                address:
                    getAddress(
                        pairTokenAddress
                    ),
                abi:
                    erc20Abi,
                functionName:
                    "balanceOf",
                args: [
                    getAddress(
                        walletAddress
                    ),
                ],
            })

    return Number(
        formatUnits(
            balance,
            18
        )
    )
}

export async function getPairMarketQuote(
    marketAddress: Address,
    tokenAmount: string,
    action:
        | "buy"
        | "sell"
) {
    const amount =
        parseWholeTokens(
            tokenAmount
        )

    const quote =
        await publicClient
            .readContract({
                address:
                    getAddress(
                        marketAddress
                    ),
                abi:
                    pairMarketAbi,
                functionName:
                    action === "buy"
                        ? "quoteBuy"
                        : "quoteSell",
                args: [
                    amount,
                ],
            })

    return {
        raw:
            quote,

        formatted:
            Number(
                formatUnits(
                    quote,
                    6
                )
            ),
    }
}

export async function buyPairTokens(
    marketAddress: Address,
    quoteTokenAddress: Address,
    tokenAmount: string
) {
    const {
        walletClient,
        account,
    } =
        await getWallet()

    const market =
        getAddress(
            marketAddress
        )

    const quoteToken =
        getAddress(
            quoteTokenAddress
        )

    const amount =
        parseWholeTokens(
            tokenAmount
        )

    const cost =
        await publicClient
            .readContract({
                address:
                    market,
                abi:
                    pairMarketAbi,
                functionName:
                    "quoteBuy",
                args: [
                    amount,
                ],
            })


    const balance =
        await publicClient
            .readContract({
                address:
                    quoteToken,
                abi:
                    erc20Abi,
                functionName:
                    "balanceOf",
                args: [
                    account,
                ],
            })

    if (
        balance <
        cost
    ) {
        throw new Error(
            `Insufficient MockUSDC balance. This purchase requires ${formatUnits(
                cost,
                6
            )} USDC.`
        )
    }

    const allowance =
        await publicClient
            .readContract({
                address:
                    quoteToken,
                abi:
                    erc20Abi,
                functionName:
                    "allowance",
                args: [
                    account,
                    market,
                ],
            })

    if (
        allowance <
        cost
    ) {
        const approvalHash =
            await walletClient
                .writeContract({
                    account,
                    chain:
                        foundry,
                    address:
                        quoteToken,
                    abi:
                        erc20Abi,
                    functionName:
                        "approve",
                    args: [
                        market,
                        cost,
                    ],
                })

        await publicClient
            .waitForTransactionReceipt({
                hash:
                    approvalHash,
            })
    }

    /*
     * Allow 1% movement before reverting.
     */
    const maxQuoteAmount =
        cost +
        cost / 100n +
        1n

    const hash =
        await walletClient
            .writeContract({
                account,
                chain:
                    foundry,
                address:
                    market,
                abi:
                    pairMarketAbi,
                functionName:
                    "buy",
                args: [
                    amount,
                    maxQuoteAmount,
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
            "Pair Token purchase reverted."
        )
    }

    return {
        hash,
        receipt,
        cost,
    }
}

export async function sellPairTokens(
    marketAddress: Address,
    pairTokenAddress: Address,
    tokenAmount: string
) {
    const {
        walletClient,
        account,
    } =
        await getWallet()

    const market =
        getAddress(
            marketAddress
        )

    const pairToken =
        getAddress(
            pairTokenAddress
        )

    const amount =
        parseWholeTokens(
            tokenAmount
        )

    const refund =
        await publicClient
            .readContract({
                address:
                    market,
                abi:
                    pairMarketAbi,
                functionName:
                    "quoteSell",
                args: [
                    amount,
                ],
            })

    const allowance =
        await publicClient
            .readContract({
                address:
                    pairToken,
                abi:
                    erc20Abi,
                functionName:
                    "allowance",
                args: [
                    account,
                    market,
                ],
            })

    if (
        allowance <
        amount
    ) {
        const approvalHash =
            await walletClient
                .writeContract({
                    account,
                    chain:
                        foundry,
                    address:
                        pairToken,
                    abi:
                        erc20Abi,
                    functionName:
                        "approve",
                    args: [
                        market,
                        amount,
                    ],
                })

        await publicClient
            .waitForTransactionReceipt({
                hash:
                    approvalHash,
            })
    }

    /*
     * Allow 1% downward movement.
     */
    const minQuoteAmount =
        refund -
        refund / 100n

    const hash =
        await walletClient
            .writeContract({
                account,
                chain:
                    foundry,
                address:
                    market,
                abi:
                    pairMarketAbi,
                functionName:
                    "sell",
                args: [
                    amount,
                    minQuoteAmount,
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
            "Pair Token sale reverted."
        )
    }

    return {
        hash,
        receipt,
        refund,
    }
}

export async function getPairMarketActivationDeadline() {
    const pendingBlock =
        await publicClient.getBlock({
            blockTag: "pending",
        })

    return (
        pendingBlock.timestamp +
        60n * 60n
    )
}

/*
 * MARKET ACTIVATION
 *
 * One Pair member signs this.
 * The other member submits createMarket().
 */

export async function signPairMarketActivation(
    pairId: bigint,
    tokenName: string,
    tokenSymbol: string,
    deadline: bigint
) {
    const {
        walletClient,
        account,
    } =
        await getWallet()

    const signature =
        await walletClient
            .signTypedData({
                account,

                domain: {
                    name:
                        "StudPairMarketFactory",
                    version:
                        "1",
                    chainId:
                        31337,
                    verifyingContract:
                        PAIR_MARKET_FACTORY_ADDRESS,
                },

                types: {
                    ActivateMarket: [
                        {
                            name:
                                "pairId",
                            type:
                                "uint256",
                        },
                        {
                            name:
                                "tokenName",
                            type:
                                "string",
                        },
                        {
                            name:
                                "tokenSymbol",
                            type:
                                "string",
                        },
                        {
                            name:
                                "deadline",
                            type:
                                "uint256",
                        },
                    ],
                },

                primaryType:
                    "ActivateMarket",

                message: {
                    pairId,
                    tokenName,
                    tokenSymbol,
                    deadline,
                },
            })

    return {
        signer:
            account,
        signature,
    }
}

export async function activatePairMarket(
    pairId: bigint,
    tokenName: string,
    tokenSymbol: string,
    deadline: bigint,
    counterpartySignature: Hex
) {
    const {
        walletClient,
        account,
    } =
        await getWallet()

    const hash =
        await walletClient
            .writeContract({
                account,
                chain:
                    foundry,
                address:
                    PAIR_MARKET_FACTORY_ADDRESS,
                abi:
                    pairMarketFactoryAbi,
                functionName:
                    "createMarket",
                args: [
                    pairId,
                    tokenName,
                    tokenSymbol,
                    deadline,
                    counterpartySignature,
                ],
            })

    const receipt =
        await publicClient
            .waitForTransactionReceipt({
                hash,
            })

    return {
        hash,
        receipt,
    }
}