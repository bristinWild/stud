import {
    createPublicClient,
    createWalletClient,
    custom,
    getAddress,
    http,
    type Address,
} from "viem"

import {
    foundry,
} from "viem/chains"

import {
    getEthereumProvider,
} from "@/lib/prediction-market"

const RPC_URL =
    process.env.NEXT_PUBLIC_RPC_URL ??
    "http://127.0.0.1:8545"

const MILESTONE_MANAGER_ADDRESS =
    getAddress(
        process.env
            .NEXT_PUBLIC_MILESTONE_MANAGER_ADDRESS!
    )

const publicClient =
    createPublicClient({
        chain: foundry,
        transport: http(RPC_URL),
    })

const milestoneAbi = [
    {
        type: "function",
        name: "nextMilestoneId",
        stateMutability: "view",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
    },

    {
        type: "function",
        name: "getMilestone",
        stateMutability: "view",
        inputs: [
            {
                name: "milestoneId",
                type: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    {
                        name: "id",
                        type: "uint256",
                    },
                    {
                        name: "pairId",
                        type: "uint256",
                    },
                    {
                        name: "proposer",
                        type: "address",
                    },
                    {
                        name: "title",
                        type: "string",
                    },
                    {
                        name: "status",
                        type: "uint8",
                    },
                    {
                        name: "memberAAccepted",
                        type: "bool",
                    },
                    {
                        name: "memberBAccepted",
                        type: "bool",
                    },
                    {
                        name: "memberAAttested",
                        type: "bool",
                    },
                    {
                        name: "memberBAttested",
                        type: "bool",
                    },
                    {
                        name: "proposedAt",
                        type: "uint64",
                    },
                    {
                        name: "activatedAt",
                        type: "uint64",
                    },
                    {
                        name: "completedAt",
                        type: "uint64",
                    },
                ],
            },
        ],
    },

    {
        type: "function",
        name: "proposeMilestone",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "pairId",
                type: "uint256",
            },
            {
                name: "title",
                type: "string",
            },
        ],
        outputs: [
            {
                name: "milestoneId",
                type: "uint256",
            },
        ],
    },

    {
        type: "function",
        name: "acceptMilestone",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "milestoneId",
                type: "uint256",
            },
        ],
        outputs: [],
    },

    {
        type: "function",
        name: "attestCompletion",
        stateMutability: "nonpayable",
        inputs: [
            {
                name: "milestoneId",
                type: "uint256",
            },
        ],
        outputs: [],
    },
] as const

export type OnchainMilestone = {
    id: bigint
    pairId: bigint
    proposer: Address
    title: string

    status:
    | 0
    | 1
    | 2

    memberAAccepted: boolean
    memberBAccepted: boolean

    memberAAttested: boolean
    memberBAttested: boolean

    proposedAt: bigint
    activatedAt: bigint
    completedAt: bigint
}

async function getWallet() {
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

export async function getPairMilestones(
    pairId: bigint
) {
    const nextId =
        await publicClient
            .readContract({
                address:
                    MILESTONE_MANAGER_ADDRESS,
                abi:
                    milestoneAbi,
                functionName:
                    "nextMilestoneId",
            })

    const results:
        OnchainMilestone[] =
        []

    for (
        let id = 1n;
        id < nextId;
        id++
    ) {
        const milestone =
            await publicClient
                .readContract({
                    address:
                        MILESTONE_MANAGER_ADDRESS,
                    abi:
                        milestoneAbi,
                    functionName:
                        "getMilestone",
                    args: [
                        id,
                    ],
                })

        if (
            milestone.pairId !==
            pairId
        ) {
            continue
        }

        results.push({
            ...milestone,
            status:
                Number(
                    milestone.status
                ) as 0 | 1 | 2,
        })
    }

    return results
}

export async function proposeMilestone(
    pairId: bigint,
    title: string
) {
    const {
        walletClient,
        account,
    } =
        await getWallet()

    if (!title.trim()) {
        throw new Error(
            "Enter a milestone title."
        )
    }

    const hash =
        await walletClient
            .writeContract({
                account,
                chain:
                    foundry,
                address:
                    MILESTONE_MANAGER_ADDRESS,
                abi:
                    milestoneAbi,
                functionName:
                    "proposeMilestone",
                args: [
                    pairId,
                    title.trim(),
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
            "Milestone proposal reverted."
        )
    }

    return {
        hash,
        receipt,
    }
}

export async function acceptMilestone(
    milestoneId: bigint
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
                    MILESTONE_MANAGER_ADDRESS,
                abi:
                    milestoneAbi,
                functionName:
                    "acceptMilestone",
                args: [
                    milestoneId,
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
            "Milestone acceptance reverted."
        )
    }

    return {
        hash,
        receipt,
    }
}

export async function attestMilestoneCompletion(
    milestoneId: bigint
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
                    MILESTONE_MANAGER_ADDRESS,
                abi:
                    milestoneAbi,
                functionName:
                    "attestCompletion",
                args: [
                    milestoneId,
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
            "Completion attestation reverted."
        )
    }

    return {
        hash,
        receipt,
    }
}