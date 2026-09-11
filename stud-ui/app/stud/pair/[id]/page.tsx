"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    CheckCircle2,
    Clock,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react"

import { useEffect, useState } from "react"

import {
    WalletButton,
} from "@/components/wallet-button"

import {
    formatUnits,
    type Address,
    type Hex,
} from "viem"

import {
    useWallet,
} from "@/components/wallet-provider"

import {
    activatePairMarket,
    buyPairTokens,
    getPairMarketActivationDeadline,
    getPairMarketQuote,
    getPairTokenBalance,
    sellPairTokens,
    signPairMarketActivation,
} from "@/lib/pair-market"

import {
    acceptMilestone,
    attestMilestoneCompletion,
    getPairMilestones,
    proposeMilestone,
    type OnchainMilestone,
} from "@/lib/milestone"

type Proposal = {
    id: number
    title: string
    description: string
    proposer: string
    reward: string | null
    reputation: number
    deadline: string
    status: string
    acceptedByA: boolean
    acceptedByB: boolean
}

type MarketConsent = {
    signer: Address
    signature: Hex
    deadline: string
    tokenName: string
    tokenSymbol: string
}

type ActiveMilestone = {
    id: number
    title: string
    description: string
    reputation: number
    reward: string | null
    deadline: string
    attestedByA: boolean
    attestedByB: boolean
}

type OnchainPair = {
    id: string
    memberA: string
    memberB: string
    reputation: string
    createdAt: string
    active: boolean

    market: {
        address: string
        pairToken: string
        quoteToken: string

        reserve: string
        currentPrice: string
        totalSupply: string
        marketCapacity: string

        graduationEligible: boolean

        basePrice: string
        slope: string
    } | null
}

const pairData = {
    "alice-leo": {
        id: "alice-leo",

        names: "Alice × Leo",
        token: "$ALICELEO",

        userA: {
            name: "Alice",
            image: "/images/alice-profile.jpg",
        },

        userB: {
            name: "Leo",
            image: "/images/profiles/leo.jpg",
        },

        reputation: 20,
        stage: "Growing Pair",

        capacity: 2000,
        reserve: 1120,

        completedMilestones: 2,

        proposals: [
            {
                id: 1,
                title: "Coffee challenge",
                description:
                    "Complete a coffee date together before September 12 and mutually attest completion.",
                proposer: "Community",
                reward: "20 USDC",
                reputation: 10,
                deadline: "Sep 12, 2026",
                status: "proposed",
                acceptedByA: false,

                // Leo already accepted
                acceptedByB: true,
            },

            {
                id: 2,
                title: "Seven-day activity streak",
                description:
                    "Complete at least one mutual check-in each day for seven consecutive days.",
                proposer: "Investor 0x72...91A",
                reward: null,
                reputation: 10,
                deadline: "Sep 18, 2026",
                status: "proposed",
                acceptedByA: false,
                acceptedByB: false,
            },
        ],

        activeMilestones: [
            {
                id: 3,
                title: "Three mutual check-ins",
                description:
                    "Complete three shared check-ins before the deadline.",
                reputation: 10,
                reward: null,
                deadline: "Sep 10, 2026",
                attestedByA: true,
                attestedByB: false,
            },
        ],

        history: [
            {
                id: 4,
                title: "First video call",
                completedAt: "Sep 6, 2026",
                reputation: 10,
            },

            {
                id: 5,
                title: "Shared playlist challenge",
                completedAt: "Sep 8, 2026",
                reputation: 10,
            },
        ],
    },

    "alice-noah": {
        id: "alice-noah",

        names: "Alice × Noah",
        token: "$ALICENOAH",

        userA: {
            name: "Alice",
            image: "/images/alice-profile.jpg",
        },

        userB: {
            name: "Noah",
            image: "/images/profiles/noah.jpg",
        },

        reputation: 40,
        stage: "Growing Pair",

        capacity: 2000,
        reserve: 1680,

        completedMilestones: 4,

        proposals: [
            {
                id: 1,
                title: "Weekend photo challenge",
                description:
                    "Take part in a shared weekend photo challenge and mutually attest completion.",
                proposer: "Community",
                reward: "15 USDC",
                reputation: 10,
                deadline: "Sep 15, 2026",
                status: "proposed",
                acceptedByA: false,
                acceptedByB: false,
            },
        ],

        activeMilestones: [
            {
                id: 2,
                title: "Mutual check-in",
                description:
                    "Complete one verified mutual check-in before September 11.",
                reputation: 10,
                reward: null,
                deadline: "Sep 11, 2026",
                attestedByA: false,
                attestedByB: true,
            },
        ],

        history: [
            {
                id: 3,
                title: "First video call",
                completedAt: "Sep 2, 2026",
                reputation: 10,
            },

            {
                id: 4,
                title: "Three-day activity streak",
                completedAt: "Sep 4, 2026",
                reputation: 10,
            },

            {
                id: 5,
                title: "Shared music challenge",
                completedAt: "Sep 6, 2026",
                reputation: 10,
            },

            {
                id: 6,
                title: "Mutual check-in streak",
                completedAt: "Sep 8, 2026",
                reputation: 10,
            },
        ],
    },
}

export default function PairDashboardPage() {
    const router = useRouter()

    const {
        address:
        walletAddress,
    } =
        useWallet()

    const params = useParams<{
        id: string
    }>()

    const pair =
        params.id === "1"
            ? pairData["alice-leo"]
            : params.id === "2"
                ? pairData["alice-noah"]
                : pairData["alice-leo"]

    const pairId =
        params.id

    const backendUrl =
        process.env
            .NEXT_PUBLIC_BACKEND_URL ??
        "http://localhost:3001"

    const [
        onchainPair,
        setOnchainPair,
    ] = useState<OnchainPair | null>(
        null
    )

    const [
        loadingPair,
        setLoadingPair,
    ] = useState(true)

    const [
        pairError,
        setPairError,
    ] = useState("")

    const [
        tokenAmount,
        setTokenAmount,
    ] = useState("1")

    const [
        marketMode,
        setMarketMode,
    ] =
        useState<"buy" | "sell">(
            "buy"
        )

    const [
        quotedUsdc,
        setQuotedUsdc,
    ] =
        useState<number | null>(
            null
        )

    const [
        pairTokenBalance,
        setPairTokenBalance,
    ] =
        useState(0)

    const [
        tradingMarket,
        setTradingMarket,
    ] =
        useState(false)

    const [
        marketMessage,
        setMarketMessage,
    ] =
        useState("")

    const [
        milestones,
        setMilestones,
    ] =
        useState<
            OnchainMilestone[]
        >([])

    const [
        milestoneTitle,
        setMilestoneTitle,
    ] =
        useState("")

    const [
        loadingMilestones,
        setLoadingMilestones,
    ] =
        useState(false)

    const [
        milestoneActionId,
        setMilestoneActionId,
    ] =
        useState<bigint | null>(
            null
        )

    const [
        milestoneMessage,
        setMilestoneMessage,
    ] =
        useState("")

    const [
        marketConsent,
        setMarketConsent,
    ] =
        useState<MarketConsent | null>(
            null
        )

    const [
        marketActivationBusy,
        setMarketActivationBusy,
    ] =
        useState(false)

    const [
        marketActivationMessage,
        setMarketActivationMessage,
    ] =
        useState("")


    const marketTokenName =
        `${pair.names} Pair Token`

    const marketTokenSymbol =
        pair.token.replace(
            "$",
            ""
        )

    const consentStorageKey =
        `stud-market-consent-${pairId}`


    async function loadPair() {
        try {
            setLoadingPair(true)
            setPairError("")

            const response =
                await fetch(
                    `${backendUrl}/onchain/pair/${pairId}`,
                    {
                        cache:
                            "no-store",
                    }
                )

            if (!response.ok) {
                throw new Error(
                    "Could not load Pair."
                )
            }

            const data:
                OnchainPair =
                await response.json()

            setOnchainPair(
                data
            )
        } catch (error) {
            console.error(
                error
            )

            setPairError(
                error instanceof Error
                    ? error.message
                    : "Could not load Pair."
            )
        } finally {
            setLoadingPair(
                false
            )
        }
    }


    async function loadMilestones() {
        try {
            setLoadingMilestones(
                true
            )

            const result =
                await getPairMilestones(
                    BigInt(pairId)
                )

            setMilestones(
                result
            )
        } catch (error) {
            console.error(
                error
            )

            setMilestoneMessage(
                error instanceof Error
                    ? error.message
                    : "Could not load milestones."
            )
        } finally {
            setLoadingMilestones(
                false
            )
        }
    }

    const [proposals, setProposals] = useState<Proposal[]>(
        pair.proposals
    )

    const [activeMilestones, setActiveMilestones] =
        useState<ActiveMilestone[]>(
            pair.activeMilestones
        )



    useEffect(() => {
        setProposals(pair.proposals)
        setActiveMilestones(pair.activeMilestones)
    }, [pair.id])

    useEffect(() => {
        void loadPair()
    }, [pairId])

    useEffect(() => {
        void loadMilestones()
    }, [pairId])

    useEffect(() => {
        async function refreshMarketUserState() {
            if (
                !walletAddress ||
                !onchainPair?.market
            ) {
                setPairTokenBalance(
                    0
                )

                return
            }

            try {
                const balance =
                    await getPairTokenBalance(
                        onchainPair
                            .market
                            .pairToken as Address,

                        walletAddress
                    )

                setPairTokenBalance(
                    balance
                )
            } catch (
            error
            ) {
                console.error(
                    error
                )
            }
        }

        void refreshMarketUserState()
    }, [
        walletAddress,
        onchainPair?.market?.pairToken,
    ])

    useEffect(() => {
        async function updateQuote() {
            if (
                !onchainPair?.market ||
                !tokenAmount ||
                Number(tokenAmount) <= 0
            ) {
                setQuotedUsdc(
                    null
                )

                return
            }

            if (
                !Number.isInteger(
                    Number(tokenAmount)
                )
            ) {
                setQuotedUsdc(
                    null
                )

                return
            }

            try {
                if (
                    marketMode === "sell" &&
                    Number(tokenAmount) >
                    pairTokenBalance
                ) {
                    setQuotedUsdc(
                        null
                    )

                    return
                }

                const quote =
                    await getPairMarketQuote(
                        onchainPair
                            .market
                            .address as Address,

                        tokenAmount,

                        marketMode
                    )

                setQuotedUsdc(
                    quote.formatted
                )
            } catch (error) {
                console.error(
                    "Pair market quote failed:",
                    error
                )

                setQuotedUsdc(
                    null
                )
            }
        }

        void updateQuote()
    }, [
        tokenAmount,
        marketMode,
        pairTokenBalance,
        onchainPair?.market?.address,
    ])

    useEffect(() => {
        try {
            const stored =
                window.localStorage.getItem(
                    consentStorageKey
                )

            if (!stored) {
                return
            }

            const parsed =
                JSON.parse(
                    stored
                ) as MarketConsent

            setMarketConsent(
                parsed
            )
        } catch (error) {
            console.error(
                "Could not restore market consent:",
                error
            )
        }
    }, [consentStorageKey])

    useEffect(() => {
        if (
            !onchainPair?.market?.address
        ) {
            return
        }

        window.localStorage.removeItem(
            consentStorageKey
        )

        setMarketConsent(
            null
        )
    }, [
        onchainPair?.market?.address,
        consentStorageKey,
    ])
    const handleAcceptProposal = (proposalId: number) => {
        const proposal = proposals.find(
            (item) => item.id === proposalId
        )

        if (!proposal) return

        const acceptedProposal = {
            ...proposal,
            acceptedByA: true,
        }

        // Other Pair member already accepted
        if (acceptedProposal.acceptedByB) {
            setProposals((current) =>
                current.filter(
                    (item) => item.id !== proposalId
                )
            )

            setActiveMilestones((current) => [
                ...current,
                {
                    id: acceptedProposal.id,
                    title: acceptedProposal.title,
                    description: acceptedProposal.description,
                    reputation: acceptedProposal.reputation,
                    reward: acceptedProposal.reward,
                    deadline: acceptedProposal.deadline,

                    // Nobody has attested completion yet
                    attestedByA: false,
                    attestedByB: false,
                },
            ])

            return
        }

        // Alice accepted, but waiting on other Pair member
        setProposals((current) =>
            current.map((item) =>
                item.id === proposalId
                    ? acceptedProposal
                    : item
            )
        )
    }

    const handleRejectProposal = (proposalId: number) => {
        setProposals((current) =>
            current.filter(
                (item) => item.id !== proposalId
            )
        )
    }

    const reputation =
        onchainPair
            ? Number(
                onchainPair.reputation
            )
            : pair.reputation

    const capacity =
        onchainPair?.market
            ? Number(
                formatUnits(
                    BigInt(
                        onchainPair
                            .market
                            .marketCapacity
                    ),
                    6
                )
            )
            : 0

    const reserve =
        onchainPair?.market
            ? Number(
                formatUnits(
                    BigInt(
                        onchainPair
                            .market
                            .reserve
                    ),
                    6
                )
            )
            : 0

    const currentPrice =
        onchainPair?.market
            ? Number(
                formatUnits(
                    BigInt(
                        onchainPair
                            .market
                            .currentPrice
                    ),
                    6
                )
            )
            : 0

    const completedMilestones =
        Math.floor(
            reputation / 10
        )

    const stage =
        reputation === 0
            ? "New Pair"
            : reputation < 20
                ? "Building Pair"
                : reputation < 50
                    ? "Growing Pair"
                    : "Established Pair"

    const marketActive =
        Boolean(
            onchainPair?.market
        )


    async function handleSignMarketConsent() {
        if (
            !walletAddress ||
            !onchainPair
        ) {
            setMarketActivationMessage(
                "Connect a Pair member wallet first."
            )

            return
        }

        const isMember =
            walletAddress.toLowerCase() ===
            onchainPair.memberA.toLowerCase() ||
            walletAddress.toLowerCase() ===
            onchainPair.memberB.toLowerCase()

        if (!isMember) {
            setMarketActivationMessage(
                "Only a Pair member can provide market consent."
            )

            return
        }

        try {
            setMarketActivationBusy(
                true
            )

            setMarketActivationMessage(
                "Sign the Pair Market consent in your wallet..."
            )

            const deadline =
                await getPairMarketActivationDeadline()

            const result =
                await signPairMarketActivation(
                    BigInt(pairId),
                    marketTokenName,
                    marketTokenSymbol,
                    deadline
                )

            const consent:
                MarketConsent = {
                signer:
                    result.signer,

                signature:
                    result.signature,

                deadline:
                    deadline.toString(),

                tokenName:
                    marketTokenName,

                tokenSymbol:
                    marketTokenSymbol,
            }

            setMarketConsent(
                consent
            )

            window.localStorage.setItem(
                consentStorageKey,
                JSON.stringify(
                    consent
                )
            )

            setMarketActivationMessage(
                "Consent signed. Switch to the other Pair member to activate the market."
            )
        } catch (error) {
            setMarketActivationMessage(
                error instanceof Error
                    ? error.message
                    : "Could not sign market consent."
            )
        } finally {
            setMarketActivationBusy(
                false
            )
        }
    }

    async function handleActivateMarket() {
        if (
            !walletAddress ||
            !onchainPair ||
            !marketConsent
        ) {
            return
        }

        const wallet =
            walletAddress.toLowerCase()

        const memberA =
            onchainPair.memberA.toLowerCase()

        const memberB =
            onchainPair.memberB.toLowerCase()

        if (
            wallet !== memberA &&
            wallet !== memberB
        ) {
            setMarketActivationMessage(
                "Only the other Pair member can activate the market."
            )

            return
        }

        if (
            wallet ===
            marketConsent.signer.toLowerCase()
        ) {
            setMarketActivationMessage(
                "Switch to the other Pair member wallet."
            )

            return
        }

        try {
            setMarketActivationBusy(
                true
            )

            setMarketActivationMessage(
                "Activating Pair Market onchain..."
            )

            await activatePairMarket(
                BigInt(pairId),

                marketConsent
                    .tokenName,

                marketConsent
                    .tokenSymbol,

                BigInt(
                    marketConsent
                        .deadline
                ),

                marketConsent
                    .signature
            )

            window.localStorage.removeItem(
                consentStorageKey
            )

            setMarketConsent(
                null
            )

            setMarketActivationMessage(
                "Pair Market activated successfully."
            )

            await loadPair()
        } catch (error) {
            console.error(
                error
            )

            setMarketActivationMessage(
                error instanceof Error
                    ? error.message
                    : "Pair Market activation failed."
            )
        } finally {
            setMarketActivationBusy(
                false
            )
        }
    }




    async function handlePairTrade() {
        if (
            !walletAddress
        ) {
            setMarketMessage(
                "Connect your wallet first."
            )

            return
        }

        if (
            !onchainPair?.market
        ) {
            setMarketMessage(
                "Pair Market is not active."
            )

            return
        }

        try {
            setTradingMarket(
                true
            )

            setMarketMessage(
                marketMode ===
                    "buy"
                    ? "Waiting for Pair Token purchase confirmation..."
                    : "Waiting for Pair Token sale confirmation..."
            )

            if (
                marketMode ===
                "buy"
            ) {
                await buyPairTokens(
                    onchainPair
                        .market
                        .address as Address,

                    onchainPair
                        .market
                        .quoteToken as Address,

                    tokenAmount
                )

                setMarketMessage(
                    `Bought ${tokenAmount} ${pair.token.replace(
                        "$",
                        ""
                    )} token${tokenAmount === "1"
                        ? ""
                        : "s"
                    }.`
                )
            } else {
                await sellPairTokens(
                    onchainPair
                        .market
                        .address as Address,

                    onchainPair
                        .market
                        .pairToken as Address,

                    tokenAmount
                )

                setMarketMessage(
                    `Sold ${tokenAmount} ${pair.token.replace(
                        "$",
                        ""
                    )} token${tokenAmount === "1"
                        ? ""
                        : "s"
                    }.`
                )
            }

            await loadPair()

            const balance =
                await getPairTokenBalance(
                    onchainPair
                        .market
                        .pairToken as Address,

                    walletAddress
                )

            setPairTokenBalance(
                balance
            )
        } catch (error) {
            console.error(
                error
            )

            setMarketMessage(
                error instanceof Error
                    ? error.message
                    : "Pair Market transaction failed."
            )
        } finally {
            setTradingMarket(
                false
            )
        }
    }

    async function handleProposeMilestone() {
        try {
            setMilestoneMessage(
                "Waiting for proposal confirmation..."
            )

            await proposeMilestone(
                BigInt(pairId),
                milestoneTitle
            )

            setMilestoneTitle(
                ""
            )

            setMilestoneMessage(
                "Milestone proposed onchain."
            )

            await loadMilestones()
        } catch (error) {
            setMilestoneMessage(
                error instanceof Error
                    ? error.message
                    : "Could not propose milestone."
            )
        }
    }

    async function handleAcceptMilestone(
        milestoneId: bigint
    ) {
        try {
            setMilestoneActionId(
                milestoneId
            )

            setMilestoneMessage(
                "Waiting for acceptance confirmation..."
            )

            await acceptMilestone(
                milestoneId
            )

            setMilestoneMessage(
                "Milestone accepted."
            )

            await loadMilestones()
        } catch (error) {
            setMilestoneMessage(
                error instanceof Error
                    ? error.message
                    : "Could not accept milestone."
            )
        } finally {
            setMilestoneActionId(
                null
            )
        }
    }

    async function handleAttestMilestone(
        milestoneId: bigint
    ) {
        try {
            setMilestoneActionId(
                milestoneId
            )

            setMilestoneMessage(
                "Waiting for completion attestation..."
            )

            await attestMilestoneCompletion(
                milestoneId
            )

            setMilestoneMessage(
                "Completion attested onchain."
            )

            /*
             * Second attestation may have
             * increased reputation.
             */
            await Promise.all([
                loadMilestones(),
                loadPair(),
            ])
        } catch (error) {
            setMilestoneMessage(
                error instanceof Error
                    ? error.message
                    : "Could not attest completion."
            )
        } finally {
            setMilestoneActionId(
                null
            )
        }
    }

    const proposedMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status === 0
        )

    const activeOnchainMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status === 1
        )

    const completedOnchainMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status === 2
        )

    const connectedIsMemberA =
        Boolean(
            walletAddress &&
            onchainPair &&
            walletAddress.toLowerCase() ===
            onchainPair.memberA.toLowerCase()
        )

    const connectedIsMemberB =
        Boolean(
            walletAddress &&
            onchainPair &&
            walletAddress.toLowerCase() ===
            onchainPair.memberB.toLowerCase()
        )

    const connectedIsPairMember =
        connectedIsMemberA ||
        connectedIsMemberB

    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">
            {/* HEADER */}
            <header className="border-b border-[#3D3B3A]/10 px-6">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
                    <button
                        onClick={() => router.push("/stud/discover")}
                        className="flex items-center gap-2 text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Discover
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 text-xs text-[#3D3B3A]/45 sm:flex">
                            <HeartHandshake className="h-4 w-4" />
                            Your Pair
                        </div>

                        <WalletButton />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* ======================
            PAIR HERO
        ======================= */}
                <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                    {/* LEFT */}
                    <div>
                        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/35">
                            Your shared identity
                        </p>

                        {/* Avatars */}
                        <div className="mb-7 flex items-center">
                            <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
                                <img
                                    src={pair.userA.image}
                                    alt={pair.userA.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="-ml-5 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
                                <img
                                    src={pair.userB.image}
                                    alt={pair.userB.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E2A9F1]">
                                <HeartHandshake
                                    className="h-4 w-4"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                            <h1 className="font-serif text-5xl leading-none md:text-6xl">
                                {pair.names}
                            </h1>

                            <BadgeCheck className="h-5 w-5" />
                        </div>

                        <p className="mb-6 text-lg text-[#3D3B3A]/40">
                            {pair.token}
                        </p>

                        <span className="inline-flex rounded-full border border-[#3D3B3A]/10 bg-[#E2A9F1]/25 px-4 py-2 text-xs">
                            {stage}
                        </span>

                        <p className="mt-8 max-w-xl text-sm leading-relaxed text-[#3D3B3A]/50">
                            Complete milestones together, build your Pair reputation,
                            and progressively unlock larger economic permissions.
                        </p>

                        {loadingPair && (
                            <p className="mt-4 text-xs text-[#3D3B3A]/35">
                                Loading onchain Pair...
                            </p>
                        )}

                        {pairError && (
                            <p className="mt-4 text-xs text-red-500">
                                {pairError}
                            </p>
                        )}

                        {onchainPair && (
                            <div className="mt-5 space-y-1 text-xs text-[#3D3B3A]/35">
                                <p>
                                    Pair #{onchainPair.id}
                                </p>

                                <p>
                                    {onchainPair.active
                                        ? "Active onchain"
                                        : "Inactive"}
                                </p>

                                {marketActive && (
                                    <p>
                                        Pair token price: $
                                        {currentPrice.toFixed(
                                            2
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8">
                        <div className="mb-9 flex items-start justify-between">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                    Pair reputation
                                </p>

                                <p className="text-6xl font-light">
                                    {reputation}
                                    <span className="ml-2 text-xl text-[#3D3B3A]/25">
                                        / 100
                                    </span>
                                </p>
                            </div>

                            <Sparkles className="h-5 w-5 text-[#3D3B3A]/30" />
                        </div>

                        <div className="mb-9">
                            <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">
                                <div
                                    className="h-full rounded-full bg-[#3D3B3A]"
                                    style={{
                                        width: `${Math.min(
                                            reputation,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Metric
                                label="Market Capacity"
                                value={
                                    marketActive
                                        ? `$${capacity.toLocaleString()}`
                                        : "Not active"
                                }
                            />

                            <Metric
                                label="Reserve"
                                value={
                                    marketActive
                                        ? `$${reserve.toLocaleString()}`
                                        : "—"
                                }
                            />

                            <Metric
                                label="Completed"
                                value={String(
                                    completedMilestones
                                )}
                            />

                            <Metric
                                label="Pending Proposals"
                                value={String(
                                    proposedMilestones.length
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* WORLD ID */}
                <div className="mb-14 flex flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/15 p-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3D3B3A] text-[#E2A9F1]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-medium">
                                Verified Pair
                            </p>

                            <p className="mt-1 text-xs text-[#3D3B3A]/40">
                                Both people were World ID verified before this Pair formed.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/40">
                        <Users className="h-4 w-4" />
                        2 verified humans
                    </div>
                </div>
                {/* ======================
    PAIR MARKET
======================= */}

                <section className="mb-16">

                    <div className="mb-7">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                            Pair Market
                        </p>

                        <h2 className="font-serif text-4xl">
                            Back the Pair.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                            Pair Tokens follow an onchain bonding curve.
                            Reputation determines how much capital the
                            market is allowed to hold.
                        </p>
                    </div>

                    {marketActive &&
                        onchainPair?.market ? (
                        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">

                            {/* MARKET INFO */}

                            <div className="rounded-[2rem] border border-[#3D3B3A]/10 p-7">

                                <div className="mb-8 flex items-start justify-between">

                                    <div>
                                        <p className="text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                            Pair Token
                                        </p>

                                        <p className="mt-2 text-3xl font-medium">
                                            {pair.token}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-[#E2A9F1]/30 px-3 py-1.5 text-xs">
                                        Live
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">

                                    <Metric
                                        label="Current Price"
                                        value={`$${currentPrice.toFixed(
                                            2
                                        )}`}
                                    />

                                    <Metric
                                        label="Reserve"
                                        value={`$${reserve.toLocaleString()}`}
                                    />

                                    <Metric
                                        label="Market Capacity"
                                        value={`$${capacity.toLocaleString()}`}
                                    />

                                    <Metric
                                        label="Your Balance"
                                        value={`${pairTokenBalance.toLocaleString()} tokens`}
                                    />

                                </div>

                                <div className="mt-6 border-t border-[#3D3B3A]/10 pt-5 text-xs text-[#3D3B3A]/35">
                                    <p>
                                        Market:{" "}
                                        {onchainPair.market.address.slice(
                                            0,
                                            8
                                        )}
                                        ...
                                        {onchainPair.market.address.slice(
                                            -6
                                        )}
                                    </p>
                                </div>

                            </div>

                            {/* TRADE */}

                            <div className="rounded-[2rem] bg-[#E2A9F1]/20 p-7">

                                <div className="mb-6 grid grid-cols-2 rounded-full bg-white/60 p-1">

                                    <button
                                        onClick={() =>
                                            setMarketMode(
                                                "buy"
                                            )
                                        }
                                        className={`rounded-full py-3 text-sm transition ${marketMode ===
                                            "buy"
                                            ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                            : "text-[#3D3B3A]/50"
                                            }`}
                                    >
                                        Buy
                                    </button>

                                    <button
                                        onClick={() =>
                                            setMarketMode(
                                                "sell"
                                            )
                                        }
                                        className={`rounded-full py-3 text-sm transition ${marketMode ===
                                            "sell"
                                            ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                            : "text-[#3D3B3A]/50"
                                            }`}
                                    >
                                        Sell
                                    </button>

                                </div>

                                <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-[#3D3B3A]/35">
                                    Pair Tokens
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        tokenAmount
                                    }
                                    disabled={
                                        tradingMarket
                                    }
                                    onChange={(event) =>
                                        setTokenAmount(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="mb-4 w-full rounded-2xl border border-[#3D3B3A]/10 bg-white/60 px-5 py-4 text-2xl outline-none"
                                />

                                <div className="mb-6 rounded-2xl bg-white/50 p-5">

                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#3D3B3A]/45">
                                            {marketMode ===
                                                "buy"
                                                ? "Estimated cost"
                                                : "Estimated return"}
                                        </span>

                                        <span className="font-medium">
                                            {quotedUsdc !==
                                                null
                                                ? `$${quotedUsdc.toFixed(
                                                    2
                                                )}`
                                                : "—"}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex justify-between text-sm">
                                        <span className="text-[#3D3B3A]/45">
                                            Your Pair Tokens
                                        </span>

                                        <span>
                                            {pairTokenBalance.toLocaleString()}
                                        </span>
                                    </div>

                                </div>

                                <button
                                    disabled={
                                        tradingMarket ||
                                        !walletAddress ||
                                        quotedUsdc === null ||
                                        (
                                            marketMode ===
                                            "sell" &&
                                            Number(
                                                tokenAmount
                                            ) >
                                            pairTokenBalance
                                        )
                                    }
                                    onClick={() =>
                                        void handlePairTrade()
                                    }
                                    className="flex w-full items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                                >

                                    {tradingMarket
                                        ? "Confirming..."
                                        : marketMode ===
                                            "buy"
                                            ? `Buy ${tokenAmount || "0"} token${tokenAmount === "1"
                                                ? ""
                                                : "s"
                                            }`
                                            : `Sell ${tokenAmount || "0"} token${tokenAmount === "1"
                                                ? ""
                                                : "s"
                                            }`}

                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>

                                </button>

                                {marketMessage && (
                                    <p className="mt-4 text-xs leading-relaxed text-[#3D3B3A]/50">
                                        {marketMessage}
                                    </p>
                                )}

                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[2rem] border border-[#3D3B3A]/10 p-8">

                            <p className="text-xl font-medium">
                                Pair Market not activated.
                            </p>

                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#3D3B3A]/45">
                                Your Pair already exists socially,
                                but its financial layer requires
                                explicit consent from both members.
                            </p>

                            <div className="mt-7 rounded-2xl bg-[#E2A9F1]/20 p-5">

                                {!marketConsent ? (
                                    <>
                                        <p className="mb-4 text-sm text-[#3D3B3A]/60">
                                            First Pair member:
                                            sign the market activation consent.
                                        </p>

                                        <button
                                            disabled={
                                                marketActivationBusy ||
                                                !walletAddress
                                            }
                                            onClick={() =>
                                                void handleSignMarketConsent()
                                            }
                                            className="rounded-full bg-[#3D3B3A] px-6 py-3 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                                        >
                                            {marketActivationBusy
                                                ? "Signing..."
                                                : "Give market consent"}
                                        </button>
                                    </>
                                ) : walletAddress &&
                                    walletAddress.toLowerCase() ===
                                    marketConsent.signer.toLowerCase() ? (
                                    <>
                                        <p className="text-sm font-medium">
                                            Your consent is signed ✓
                                        </p>

                                        <p className="mt-2 text-sm text-[#3D3B3A]/45">
                                            Switch MetaMask to the
                                            other Pair member.
                                        </p>

                                        <p className="mt-3 text-xs text-[#3D3B3A]/35">
                                            Signed by{" "}
                                            {marketConsent.signer.slice(
                                                0,
                                                6
                                            )}
                                            ...
                                            {marketConsent.signer.slice(
                                                -4
                                            )}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-2 text-sm font-medium">
                                            Counterparty consent received ✓
                                        </p>

                                        <p className="mb-5 text-sm text-[#3D3B3A]/45">
                                            You are the second Pair member.
                                            Confirm to create the Pair Token
                                            and Pair Market onchain.
                                        </p>

                                        <button
                                            disabled={
                                                marketActivationBusy ||
                                                !walletAddress
                                            }
                                            onClick={() =>
                                                void handleActivateMarket()
                                            }
                                            className="rounded-full bg-[#3D3B3A] px-6 py-3 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                                        >
                                            {marketActivationBusy
                                                ? "Activating..."
                                                : "Activate Pair Market"}
                                        </button>
                                    </>
                                )}

                                {marketActivationMessage && (
                                    <p className="mt-5 text-xs leading-relaxed text-[#3D3B3A]/50">
                                        {marketActivationMessage}
                                    </p>
                                )}

                            </div>

                        </div>
                    )}

                </section>
                {/* ======================
    REAL MILESTONES
======================= */}

                <section>
                    <div className="mb-7">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                            Milestones
                        </p>

                        <h2 className="font-serif text-4xl">
                            Build your reputation together.
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                            Anyone may propose a milestone.
                            Both Pair members must accept it and
                            both must attest completion before
                            reputation is awarded.
                        </p>
                    </div>

                    {/* PROPOSE */}

                    <div className="mb-10 rounded-[2rem] bg-[#E2A9F1]/20 p-7">
                        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                            Propose milestone
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                value={
                                    milestoneTitle
                                }
                                onChange={(event) =>
                                    setMilestoneTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. Complete another verified video call"
                                className="flex-1 rounded-full border border-[#3D3B3A]/10 bg-white px-5 py-3 text-sm outline-none"
                            />

                            <button
                                disabled={
                                    !walletAddress ||
                                    !milestoneTitle.trim()
                                }
                                onClick={() =>
                                    void handleProposeMilestone()
                                }
                                className="rounded-full bg-[#3D3B3A] px-6 py-3 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                            >
                                Propose
                            </button>
                        </div>

                        {milestoneMessage && (
                            <p className="mt-4 text-xs text-[#3D3B3A]/50">
                                {milestoneMessage}
                            </p>
                        )}
                    </div>

                    {loadingMilestones && (
                        <p className="mb-5 text-sm text-[#3D3B3A]/40">
                            Loading onchain milestones...
                        </p>
                    )}

                    {/* PROPOSED */}

                    <div className="mb-12">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Proposed
                            </h3>

                            <span className="text-xs text-[#3D3B3A]/35">
                                {proposedMilestones.length}
                            </span>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {proposedMilestones.map(
                                (milestone) => {
                                    const youAccepted =
                                        connectedIsMemberA
                                            ? milestone.memberAAccepted
                                            : connectedIsMemberB
                                                ? milestone.memberBAccepted
                                                : false

                                    const otherAccepted =
                                        connectedIsMemberA
                                            ? milestone.memberBAccepted
                                            : milestone.memberAAccepted

                                    return (
                                        <div
                                            key={
                                                milestone.id.toString()
                                            }
                                            className="rounded-[2rem] border border-[#3D3B3A]/10 p-7"
                                        >
                                            <p className="mb-2 text-xs text-[#3D3B3A]/35">
                                                Milestone #
                                                {milestone.id.toString()}
                                            </p>

                                            <h4 className="text-xl font-medium">
                                                {milestone.title}
                                            </h4>

                                            <p className="mt-2 text-xs text-[#3D3B3A]/35">
                                                Proposed by{" "}
                                                {milestone.proposer.slice(
                                                    0,
                                                    6
                                                )}
                                                ...
                                                {milestone.proposer.slice(
                                                    -4
                                                )}
                                            </p>

                                            <div className="my-6 space-y-2 border-y border-[#3D3B3A]/10 py-5">
                                                <AcceptanceStatus
                                                    name="You"
                                                    accepted={
                                                        youAccepted
                                                    }
                                                />

                                                <AcceptanceStatus
                                                    name="Other member"
                                                    accepted={
                                                        otherAccepted
                                                    }
                                                />
                                            </div>

                                            <p className="mb-5 text-xs text-[#3D3B3A]/40">
                                                Completion reward:
                                                +10 Pair reputation
                                            </p>

                                            <button
                                                disabled={
                                                    !connectedIsPairMember ||
                                                    youAccepted ||
                                                    milestoneActionId ===
                                                    milestone.id
                                                }
                                                onClick={() =>
                                                    void handleAcceptMilestone(
                                                        milestone.id
                                                    )
                                                }
                                                className="w-full rounded-full bg-[#3D3B3A] px-5 py-3 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                                            >
                                                {youAccepted
                                                    ? "Accepted"
                                                    : "Accept milestone"}
                                            </button>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>

                    {/* ACTIVE */}

                    <div className="mb-12">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Active
                            </h3>

                            <span className="text-xs text-[#3D3B3A]/35">
                                {activeOnchainMilestones.length}
                            </span>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {activeOnchainMilestones.map(
                                (milestone) => {
                                    const youAttested =
                                        connectedIsMemberA
                                            ? milestone.memberAAttested
                                            : connectedIsMemberB
                                                ? milestone.memberBAttested
                                                : false

                                    const otherAttested =
                                        connectedIsMemberA
                                            ? milestone.memberBAttested
                                            : milestone.memberAAttested

                                    return (
                                        <div
                                            key={
                                                milestone.id.toString()
                                            }
                                            className="rounded-[2rem] border border-[#3D3B3A]/10 bg-[#E2A9F1]/10 p-7"
                                        >
                                            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#3D3B3A]/35">
                                                Active milestone #
                                                {milestone.id.toString()}
                                            </p>

                                            <h4 className="text-xl font-medium">
                                                {milestone.title}
                                            </h4>

                                            <div className="my-6 space-y-2 border-y border-[#3D3B3A]/10 py-5">
                                                <AcceptanceStatus
                                                    name="You completed"
                                                    accepted={
                                                        youAttested
                                                    }
                                                />

                                                <AcceptanceStatus
                                                    name="Other member completed"
                                                    accepted={
                                                        otherAttested
                                                    }
                                                />
                                            </div>

                                            <button
                                                disabled={
                                                    !connectedIsPairMember ||
                                                    youAttested ||
                                                    milestoneActionId ===
                                                    milestone.id
                                                }
                                                onClick={() =>
                                                    void handleAttestMilestone(
                                                        milestone.id
                                                    )
                                                }
                                                className="w-full rounded-full bg-[#3D3B3A] px-5 py-3 text-sm font-medium text-[#E2A9F1] disabled:opacity-40"
                                            >
                                                {youAttested
                                                    ? "Completion attested"
                                                    : "Attest completion"}
                                            </button>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>

                    {/* COMPLETED */}

                    <div>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-medium">
                                Completed
                            </h3>

                            <span className="text-xs text-[#3D3B3A]/35">
                                {completedOnchainMilestones.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {completedOnchainMilestones.map(
                                (milestone) => (
                                    <div
                                        key={
                                            milestone.id.toString()
                                        }
                                        className="flex items-center justify-between rounded-2xl bg-[#3D3B3A]/5 px-5 py-4"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {milestone.title}
                                            </p>

                                            <p className="mt-1 text-xs text-[#3D3B3A]/35">
                                                Milestone #
                                                {milestone.id.toString()}
                                            </p>
                                        </div>

                                        <span className="text-sm font-medium">
                                            +10 reputation
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

function Metric({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl bg-[#3D3B3A]/5 p-5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                {label}
            </p>

            <p className="text-xl font-medium">
                {value}
            </p>
        </div>
    )
}

function MilestoneProposal({
    proposal,
    index,
    otherUserName,
    onAccept,
    onReject,
}: {
    proposal: Proposal
    index: number
    otherUserName: string
    onAccept: () => void
    onReject: () => void
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                delay: index * 0.06,
            }}
            className="rounded-[2rem] border border-[#3D3B3A]/10 p-7"
        >
            <div className="mb-8 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E2A9F1]/40">
                    <Sparkles className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-[#3D3B3A]/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/40">
                    Proposed
                </span>
            </div>

            <p className="mb-2 text-xs text-[#3D3B3A]/35">
                Proposed by {proposal.proposer}
            </p>

            <h3 className="mb-3 text-xl font-medium">
                {proposal.title}
            </h3>

            <p className="min-h-[60px] text-sm leading-relaxed text-[#3D3B3A]/45">
                {proposal.description}
            </p>

            {/* DETAILS */}
            <div className="my-7 grid grid-cols-3 gap-3 border-y border-[#3D3B3A]/10 py-5">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Reputation
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        +{proposal.reputation}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Reward
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        {proposal.reward ?? "None"}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Deadline
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        {proposal.deadline}
                    </p>
                </div>
            </div>

            <div className="mb-6 flex items-start gap-2 text-xs leading-relaxed text-[#3D3B3A]/35">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />

                <div className="mb-6 space-y-2">
                    <AcceptanceStatus
                        name="You"
                        accepted={proposal.acceptedByA}
                    />

                    <AcceptanceStatus
                        name={otherUserName}
                        accepted={proposal.acceptedByB}
                    />
                </div>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onReject}
                    className="rounded-full border border-[#3D3B3A]/10 py-3 text-sm text-[#3D3B3A]/55 transition hover:bg-[#3D3B3A]/5"
                >
                    Reject
                </button>

                <button
                    onClick={onAccept}
                    disabled={proposal.acceptedByA}
                    className="group flex items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-5 pr-2 text-sm font-medium text-[#E2A9F1] transition-opacity disabled:cursor-default disabled:opacity-50"
                >
                    {proposal.acceptedByA
                        ? `Waiting for ${otherUserName}`
                        : "Accept"}

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                        {proposal.acceptedByA ? (
                            <Clock className="h-4 w-4" />
                        ) : (
                            <ArrowUpRight className="h-4 w-4" />
                        )}
                    </span>
                </button>
            </div>
        </motion.div>
    )
}

function AcceptanceStatus({
    name,
    accepted,
}: {
    name: string
    accepted: boolean
}) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-[#3D3B3A]/45">
                {name}
            </span>

            <span
                className={
                    accepted
                        ? "font-medium text-[#3D3B3A]"
                        : "text-[#3D3B3A]/30"
                }
            >
                {accepted ? "✓ Accepted" : "Waiting"}
            </span>
        </div>
    )
}