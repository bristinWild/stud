import {
    createPublicClient,
    createWalletClient,
    custom,
    getAddress,
    http,
    parseUnits,
    type Address,
    type EIP1193Provider,
} from 'viem'

import { foundry } from 'viem/chains'

const RPC_URL =
    process.env.NEXT_PUBLIC_RPC_URL ??
    'http://127.0.0.1:8545'

export const USDC_ADDRESS =
    getAddress(
        process.env
            .NEXT_PUBLIC_MOCK_USDC_ADDRESS!,
    )

const publicClient =
    createPublicClient({
        chain: foundry,
        transport: http(RPC_URL),
    })

const erc20Abi = [
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
] as const

const predictionMarketAbi = [
    {
        type: 'function',
        name: 'takeYes',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'takeNo',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'claim',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [],
    },
] as const

function getEthereumProvider():
    EIP1193Provider {
    if (
        typeof window === 'undefined'
    ) {
        throw new Error(
            'Wallet is only available in the browser.',
        )
    }

    const ethereum = (
        window as Window & {
            ethereum?: EIP1193Provider
        }
    ).ethereum

    if (!ethereum) {
        throw new Error(
            'No EVM browser wallet found.',
        )
    }

    return ethereum
}

async function ensureFoundryNetwork(
    provider: EIP1193Provider,
) {
    const requiredChainId =
        '0x7a69'

    const currentChainId =
        await provider.request({
            method: 'eth_chainId',
        })

    if (
        currentChainId ===
        requiredChainId
    ) {
        return
    }

    try {
        await provider.request({
            method:
                'wallet_switchEthereumChain',
            params: [
                {
                    chainId:
                        requiredChainId,
                },
            ],
        })
    } catch (error) {
        const walletError =
            error as {
                code?: number
            }

        if (
            walletError.code !== 4902
        ) {
            throw error
        }

        await provider.request({
            method:
                'wallet_addEthereumChain',
            params: [
                {
                    chainId:
                        requiredChainId,
                    chainName:
                        'Anvil Local',
                    rpcUrls: [
                        RPC_URL,
                    ],
                    nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                    },
                },
            ],
        })
    }
}

async function getWallet() {
    const provider =
        getEthereumProvider()

    await ensureFoundryNetwork(
        provider,
    )

    const walletClient =
        createWalletClient({
            chain: foundry,
            transport:
                custom(provider),
        })

    const [account] =
        await walletClient
            .requestAddresses()

    if (!account) {
        throw new Error(
            'No wallet account connected.',
        )
    }

    return {
        walletClient,
        account:
            getAddress(account),
    }
}

export function parseUsdc(
    amount: string,
) {
    return parseUnits(
        amount,
        6,
    )
}

export async function placePredictionPosition(
    marketAddress: Address,
    amount: string,
    outcome: 'YES' | 'NO',
) {
    const {
        walletClient,
        account,
    } = await getWallet()

    const market =
        getAddress(
            marketAddress,
        )

    const amountWei =
        parseUsdc(amount)

    if (
        amountWei <= 0n
    ) {
        throw new Error(
            'Enter an amount greater than 0.',
        )
    }

    const allowance =
        await publicClient
            .readContract({
                address:
                    USDC_ADDRESS,
                abi: erc20Abi,
                functionName:
                    'allowance',
                args: [
                    account,
                    market,
                ],
            })

    let approvalHash:
        `0x${string}` | undefined

    if (
        allowance < amountWei
    ) {
        approvalHash =
            await walletClient
                .writeContract({
                    account,
                    chain: foundry,
                    address:
                        USDC_ADDRESS,
                    abi: erc20Abi,
                    functionName:
                        'approve',
                    args: [
                        market,
                        amountWei,
                    ],
                })

        await publicClient
            .waitForTransactionReceipt({
                hash:
                    approvalHash,
            })
    }

    const positionHash =
        await walletClient
            .writeContract({
                account,
                chain: foundry,
                address: market,
                abi:
                    predictionMarketAbi,
                functionName:
                    outcome === 'YES'
                        ? 'takeYes'
                        : 'takeNo',
                args: [
                    amountWei,
                ],
            })

    const receipt =
        await publicClient
            .waitForTransactionReceipt({
                hash:
                    positionHash,
            })

    return {
        approvalHash,
        positionHash,
        receipt,
    }
}

export async function claimPredictionWinnings(
    marketAddress: Address,
) {
    const {
        walletClient,
        account,
    } = await getWallet()

    const hash =
        await walletClient
            .writeContract({
                account,
                chain: foundry,
                address:
                    getAddress(
                        marketAddress,
                    ),
                abi:
                    predictionMarketAbi,
                functionName:
                    'claim',
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