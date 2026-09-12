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

import { worldchainSepolia } from 'viem/chains'

const RPC_URL =
    process.env.RPC_URL ??
    worldchainSepolia.rpcUrls.default.http[0]

const MOCK_USDC_ADDRESS =
    process.env.MOCK_USDC_ADDRESS

function getUsdcAddress() {
    if (!MOCK_USDC_ADDRESS) {
        throw new Error(
            "MOCK_USDC_ADDRESS is not configured."
        )
    }

    return getAddress(MOCK_USDC_ADDRESS)
}

const publicClient =
    createPublicClient({
        chain: worldchainSepolia,
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

type EIP6963ProviderDetail = {
    info: {
        uuid: string
        name: string
        icon: string
        rdns: string
    }
    provider: EIP1193Provider
}

export async function getEthereumProvider():
    Promise<EIP1193Provider> {
    if (
        typeof window === "undefined"
    ) {
        throw new Error(
            "Wallet is only available in the browser."
        )
    }

    const providers:
        EIP6963ProviderDetail[] = []

    const handleProvider = (
        event: Event
    ) => {
        const customEvent =
            event as CustomEvent<EIP6963ProviderDetail>

        const exists =
            providers.some(
                (item) =>
                    item.info.uuid ===
                    customEvent.detail.info.uuid
            )

        if (!exists) {
            providers.push(
                customEvent.detail
            )
        }
    }

    window.addEventListener(
        "eip6963:announceProvider",
        handleProvider
    )

    window.dispatchEvent(
        new Event(
            "eip6963:requestProvider"
        )
    )

    await new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                400
            )
    )

    window.removeEventListener(
        "eip6963:announceProvider",
        handleProvider
    )

    console.table(
        providers.map(
            (item) => ({
                name:
                    item.info.name,
                rdns:
                    item.info.rdns,
                uuid:
                    item.info.uuid,
            })
        )
    )

    const orderedProviders = [
        ...providers.filter(
            (item) =>
                item.info.rdns ===
                "io.metamask"
        ),

        ...providers.filter(
            (item) =>
                item.info.rdns !==
                "io.metamask"
        ),
    ]

    for (const item of orderedProviders) {
        try {
            const chainId =
                await item.provider.request({
                    method: "eth_chainId",
                })

            console.log(
                "Wallet probe:",
                item.info.name,
                item.info.rdns,
                chainId
            )

            console.log(
                "Using wallet:",
                item.info.name,
                item.info.rdns
            )

            return item.provider
        } catch (error) {
            console.warn(
                "Skipping broken provider:",
                item.info.name,
                item.info.rdns,
                error
            )
        }
    }
    throw new Error(
        "No EVM wallet connected to World Chain Sepolia was found."
    )
}

type EventfulProvider =
    EIP1193Provider & {
        on?: (
            event: string,
            listener: (...args: any[]) => void
        ) => void

        removeListener?: (
            event: string,
            listener: (...args: any[]) => void
        ) => void
    }

export async function watchWalletChanges(
    onAccountsChanged: (
        account: Address | null
    ) => void,
    onChainChanged?: (
        chainId: string
    ) => void
) {
    const provider =
        (await getEthereumProvider()) as EventfulProvider

    const handleAccountsChanged = (
        accounts: string[]
    ) => {
        if (
            !accounts ||
            accounts.length === 0
        ) {
            onAccountsChanged(null)
            return
        }

        onAccountsChanged(
            getAddress(accounts[0])
        )
    }

    const handleChainChanged = (
        chainId: string
    ) => {
        onChainChanged?.(
            chainId
        )
    }

    provider.on?.(
        "accountsChanged",
        handleAccountsChanged
    )

    provider.on?.(
        "chainChanged",
        handleChainChanged
    )

    return () => {
        provider.removeListener?.(
            "accountsChanged",
            handleAccountsChanged
        )

        provider.removeListener?.(
            "chainChanged",
            handleChainChanged
        )
    }
}

export async function disconnectWallet() {
    const provider =
        await getEthereumProvider()

    try {
        await provider.request({
            method:
                "wallet_revokePermissions",
            params: [
                {
                    eth_accounts: {},
                },
            ],
        })
    } catch {
        // Some wallets do not support permission revocation.
        // The React app can still clear its local wallet state.
    }
}

async function ensureFoundryNetwork(
    provider: EIP1193Provider,
) {
    const requiredChainId =
        '0x12c1'

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
                        'World Chain Sepolia',
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
        await getEthereumProvider()

    const walletClient =
        createWalletClient({
            chain: worldchainSepolia,
            transport: custom(provider),
        })

    const [account] =
        await walletClient.requestAddresses()

    if (!account) {
        throw new Error(
            "No wallet account connected."
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
                    getUsdcAddress(),
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
                    chain: worldchainSepolia,
                    address:
                        getUsdcAddress(),
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
                chain: worldchainSepolia,
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
                chain: worldchainSepolia,
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

export async function connectWallet() {
    const provider =
        await getEthereumProvider()

    await ensureFoundryNetwork(
        provider
    )

    const walletClient =
        createWalletClient({
            chain: worldchainSepolia,
            transport: custom(
                provider
            ),
        })

    const [account] =
        await walletClient.requestAddresses()

    if (!account) {
        throw new Error(
            "No wallet account connected."
        )
    }

    return getAddress(
        account
    )
}


export async function getConnectedWallet() {
    const provider =
        await getEthereumProvider()

    const chainId =
        await provider.request({
            method:
                "eth_chainId",
        })

    if (
        chainId !==
        "0x12c1"
    ) {
        return null
    }

    const accounts =
        (await provider.request({
            method:
                "eth_accounts",
        })) as string[]

    if (
        !accounts ||
        accounts.length === 0
    ) {
        return null
    }

    return getAddress(
        accounts[0]
    )
}