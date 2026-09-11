"use client"

import {
    useCallback,
    useEffect,
    useState,
} from "react"

import {
    useParams,
    useRouter,
} from "next/navigation"

import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    CheckCircle2,
    Circle,
    HeartHandshake,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Trophy,
} from "lucide-react"

import {
    formatUnits,
    type Address,
} from "viem"

import {
    WalletButton,
} from "@/components/wallet-button"

import {
    useWallet,
} from "@/components/wallet-provider"

import {
    buyPairTokens,
    getPairMarketQuote,
    getPairTokenBalance,
    sellPairTokens,
} from "@/lib/pair-market"

import {
    getPairMilestones,
    type OnchainMilestone,
} from "@/lib/milestone"


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


const pairMeta = {
    "1": {
        names: "Alice × Leo",
        token: "$ALICELEO",

        userA: {
            name: "Alice",
            image:
                "/images/alice-profile.jpg",
        },

        userB: {
            name: "Leo",
            image:
                "/images/profiles/leo.jpg",
        },
    },

    "2": {
        names: "Alice × Noah",
        token: "$ALICENOAH",

        userA: {
            name: "Alice",
            image:
                "/images/alice-profile.jpg",
        },

        userB: {
            name: "Noah",
            image:
                "/images/profiles/noah.jpg",
        },
    },
}


export default function PairMarketPage() {
    const router =
        useRouter()

    const params =
        useParams<{
            id: string
        }>()

    const pairId =
        params.id

    const {
        address:
        walletAddress,
    } =
        useWallet()

    const backendUrl =
        process.env
            .NEXT_PUBLIC_BACKEND_URL ??
        "http://localhost:3001"

    const meta =
        pairMeta[
        pairId as keyof typeof pairMeta
        ] ?? {
            names:
                `Pair #${pairId}`,

            token:
                `$PAIR${pairId}`,

            userA: {
                name:
                    "Member A",

                image:
                    "/images/alice-profile.jpg",
            },

            userB: {
                name:
                    "Member B",

                image:
                    "/images/profiles/noah.jpg",
            },
        }


    const [
        onchainPair,
        setOnchainPair,
    ] =
        useState<OnchainPair | null>(
            null
        )

    const [
        milestones,
        setMilestones,
    ] =
        useState<
            OnchainMilestone[]
        >([])

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        pageError,
        setPageError,
    ] =
        useState("")


    const [
        tradeMode,
        setTradeMode,
    ] =
        useState<"buy" | "sell">(
            "buy"
        )

    /*
     * PairMarket trades WHOLE
     * Pair Tokens.
     */
    const [
        tradeAmount,
        setTradeAmount,
    ] =
        useState("1")

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
        trading,
        setTrading,
    ] =
        useState(false)

    const [
        tradeMessage,
        setTradeMessage,
    ] =
        useState("")


    /*
     * ===========================
     * LOAD REAL PAIR
     * ===========================
     */

    const loadPair =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    )

                    setPageError(
                        ""
                    )

                    const response =
                        await fetch(
                            `${backendUrl}/onchain/pair/${pairId}`,
                            {
                                cache:
                                    "no-store",
                            }
                        )

                    if (
                        !response.ok
                    ) {
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
                } catch (
                error
                ) {
                    console.error(
                        error
                    )

                    setPageError(
                        error instanceof Error
                            ? error.message
                            : "Could not load Pair."
                    )
                } finally {
                    setLoading(
                        false
                    )
                }
            },
            [
                backendUrl,
                pairId,
            ]
        )


    const loadMilestones =
        useCallback(
            async () => {
                try {
                    const result =
                        await getPairMilestones(
                            BigInt(
                                pairId
                            )
                        )

                    setMilestones(
                        result
                    )
                } catch (
                error
                ) {
                    console.error(
                        "Could not load Pair milestones:",
                        error
                    )
                }
            },
            [
                pairId,
            ]
        )


    useEffect(
        () => {
            void Promise.all([
                loadPair(),
                loadMilestones(),
            ])
        },
        [
            loadPair,
            loadMilestones,
        ]
    )


    /*
     * ===========================
     * WALLET TOKEN BALANCE
     * ===========================
     */

    useEffect(
        () => {
            async function loadBalance() {
                if (
                    !walletAddress ||
                    !onchainPair
                        ?.market
                        ?.pairToken
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
                        "Could not load Pair Token balance:",
                        error
                    )
                }
            }

            void loadBalance()
        },
        [
            walletAddress,
            onchainPair
                ?.market
                ?.pairToken,
        ]
    )


    /*
     * ===========================
     * REAL ONCHAIN QUOTE
     * ===========================
     */

    useEffect(
        () => {
            async function updateQuote() {
                if (
                    !onchainPair
                        ?.market
                        ?.address
                ) {
                    setQuotedUsdc(
                        null
                    )

                    return
                }

                const amount =
                    Number(
                        tradeAmount
                    )

                if (
                    !amount ||
                    amount <= 0 ||
                    !Number.isInteger(
                        amount
                    )
                ) {
                    setQuotedUsdc(
                        null
                    )

                    return
                }

                if (
                    tradeMode ===
                    "sell" &&
                    amount >
                    pairTokenBalance
                ) {
                    setQuotedUsdc(
                        null
                    )

                    return
                }

                try {
                    const quote =
                        await getPairMarketQuote(
                            onchainPair
                                .market
                                .address as Address,

                            tradeAmount,

                            tradeMode
                        )

                    setQuotedUsdc(
                        quote.formatted
                    )
                } catch (
                error
                ) {
                    console.error(
                        "Pair quote failed:",
                        error
                    )

                    setQuotedUsdc(
                        null
                    )
                }
            }

            void updateQuote()
        },
        [
            tradeAmount,
            tradeMode,
            pairTokenBalance,
            onchainPair
                ?.market
                ?.address,
        ]
    )


    /*
     * ===========================
     * REAL BUY / SELL
     * ===========================
     */

    async function handleTrade() {
        if (
            !walletAddress
        ) {
            setTradeMessage(
                "Connect your wallet first."
            )

            return
        }

        if (
            !onchainPair?.market
        ) {
            setTradeMessage(
                "This Pair Market is not active."
            )

            return
        }

        try {
            setTrading(
                true
            )

            setTradeMessage(
                tradeMode ===
                    "buy"
                    ? "Confirm the Pair Token purchase in your wallet..."
                    : "Confirm the Pair Token sale in your wallet..."
            )

            if (
                tradeMode ===
                "buy"
            ) {
                await buyPairTokens(
                    onchainPair
                        .market
                        .address as Address,

                    onchainPair
                        .market
                        .quoteToken as Address,

                    tradeAmount
                )

                setTradeMessage(
                    `Bought ${tradeAmount} ${meta.token}.`
                )
            } else {
                await sellPairTokens(
                    onchainPair
                        .market
                        .address as Address,

                    onchainPair
                        .market
                        .pairToken as Address,

                    tradeAmount
                )

                setTradeMessage(
                    `Sold ${tradeAmount} ${meta.token}.`
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
        } catch (
        error
        ) {
            console.error(
                error
            )

            setTradeMessage(
                error instanceof Error
                    ? error.message
                    : "Pair Market transaction failed."
            )
        } finally {
            setTrading(
                false
            )
        }
    }


    /*
     * ===========================
     * DERIVED REAL DATA
     * ===========================
     */

    const reputation =
        onchainPair
            ? Number(
                onchainPair
                    .reputation
            )
            : 0

    const marketActive =
        Boolean(
            onchainPair?.market
        )

    const price =
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

    const totalSupply =
        onchainPair?.market
            ? Number(
                formatUnits(
                    BigInt(
                        onchainPair
                            .market
                            .totalSupply
                    ),
                    18
                )
            )
            : 0

    const remainingCapacity =
        Math.max(
            capacity -
            reserve,
            0
        )

    const completedMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status ===
                2
        )

    const stage =
        reputation === 0
            ? "New Pair"
            : reputation < 20
                ? "Building Pair"
                : reputation < 50
                    ? "Growing Pair"
                    : reputation < 70
                        ? "Established Pair"
                        : "Graduation Stage"

    const reputationGraduationProgress =
        Math.min(
            (
                reputation /
                70
            ) *
            100,
            100
        )

    const reserveGraduationProgress =
        Math.min(
            (
                reserve /
                10000
            ) *
            100,
            100
        )

    const graduationEligible =
        Boolean(
            onchainPair
                ?.market
                ?.graduationEligible
        )

    const nextUnlock =
        reputation < 20
            ? {
                reputation:
                    20,

                capacity:
                    "$2,000 market capacity",
            }
            : reputation < 50
                ? {
                    reputation:
                        50,

                    capacity:
                        "$10,000 market capacity",
                }
                : reputation < 70
                    ? {
                        reputation:
                            70,

                        capacity:
                            "$20,000 capacity + graduation eligibility",
                    }
                    : null

    const exceedsCapacity =
        tradeMode ===
        "buy" &&
        quotedUsdc !==
        null &&
        quotedUsdc >
        remainingCapacity


    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">

            {/* HEADER */}

            <header className="border-b border-[#3D3B3A]/10 px-6">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">

                    <button
                        onClick={() =>
                            router.push(
                                "/investor"
                            )
                        }
                        className="flex items-center gap-2 text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A]"
                    >
                        <ArrowLeft className="h-4 w-4" />

                        Markets
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                "/"
                            )
                        }
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <div className="flex items-center gap-4">

                        <div className="hidden items-center gap-2 text-xs text-[#3D3B3A]/45 sm:flex">

                            <TrendingUp className="h-4 w-4" />

                            Investor

                        </div>

                        <WalletButton />

                    </div>

                </div>

            </header>


            <div className="mx-auto max-w-7xl px-6 py-12">

                {loading && (
                    <p className="mb-8 text-sm text-[#3D3B3A]/40">
                        Loading Pair Market...
                    </p>
                )}

                {pageError && (
                    <p className="mb-8 text-sm text-red-500">
                        {pageError}
                    </p>
                )}


                {/* ==========================
                    PAIR HERO
                ========================== */}

                <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">

                    <div>

                        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/40">
                            Pair Token
                        </p>

                        <div className="mb-8 flex items-center">

                            <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-4 border-background">

                                <img
                                    src={
                                        meta
                                            .userA
                                            .image
                                    }
                                    alt={
                                        meta
                                            .userA
                                            .name
                                    }
                                    className="h-full w-full object-cover"
                                />

                            </div>

                            <div className="-ml-5 h-20 w-20 overflow-hidden rounded-full border-4 border-background">

                                <img
                                    src={
                                        meta
                                            .userB
                                            .image
                                    }
                                    alt={
                                        meta
                                            .userB
                                            .name
                                    }
                                    className="h-full w-full object-cover"
                                />

                            </div>

                            <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E2A9F1]">

                                <HeartHandshake
                                    className="h-4 w-4"
                                    strokeWidth={
                                        1.5
                                    }
                                />

                            </div>

                        </div>

                        <div className="mb-3 flex items-center gap-2">

                            <h1 className="font-serif text-5xl leading-none md:text-6xl">
                                {
                                    meta.names
                                }
                            </h1>

                            <BadgeCheck className="h-5 w-5" />

                        </div>

                        <p className="mb-6 text-lg text-[#3D3B3A]/45">
                            {meta.token}
                        </p>

                        <div className="inline-flex items-center rounded-full border border-[#3D3B3A]/10 bg-[#E2A9F1]/25 px-4 py-2 text-xs">
                            {stage}
                        </div>

                        <p className="mt-8 max-w-xl text-sm leading-relaxed text-[#3D3B3A]/50">
                            A persistent market around the shared
                            onchain identity created by{" "}
                            {meta.userA.name} and{" "}
                            {meta.userB.name}.
                            Reputation controls protocol permissions
                            while market demand determines the token
                            price.
                        </p>

                        {onchainPair && (
                            <div className="mt-5 space-y-1 text-xs text-[#3D3B3A]/35">

                                <p>
                                    Pair #
                                    {
                                        onchainPair.id
                                    }
                                </p>

                                <p>
                                    {
                                        marketActive
                                            ? "Pair Market live onchain"
                                            : "Pair Market not activated"
                                    }
                                </p>

                            </div>
                        )}

                    </div>


                    {/* LIVE PRICE */}

                    <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8 md:p-10">

                        <div className="mb-12 flex items-start justify-between">

                            <div>

                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                    Current price
                                </p>

                                <p className="text-6xl font-light tracking-tight">
                                    {
                                        marketActive
                                            ? `$${price.toFixed(
                                                2
                                            )}`
                                            : "—"
                                    }
                                </p>

                            </div>

                            <div className="rounded-full bg-[#E2A9F1]/40 px-4 py-2 text-xs font-medium">
                                {
                                    marketActive
                                        ? "Live onchain"
                                        : "Not active"
                                }
                            </div>

                        </div>


                        <div className="mb-10">

                            <div className="mb-3 flex items-center justify-between text-sm">

                                <span className="text-[#3D3B3A]/45">
                                    Pair reputation
                                </span>

                                <span>
                                    {
                                        reputation
                                    }{" "}
                                    / 100
                                </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                                <div
                                    className="h-full rounded-full bg-[#3D3B3A]"
                                    style={{
                                        width:
                                            `${Math.min(
                                                reputation,
                                                100
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>


                        <div className="grid grid-cols-2 gap-4">

                            <MarketStat
                                label="Reserve"
                                value={
                                    marketActive
                                        ? `$${reserve.toLocaleString()}`
                                        : "—"
                                }
                            />

                            <MarketStat
                                label="Market capacity"
                                value={
                                    marketActive
                                        ? `$${capacity.toLocaleString()}`
                                        : "—"
                                }
                            />

                            <MarketStat
                                label="Token supply"
                                value={
                                    marketActive
                                        ? totalSupply.toLocaleString()
                                        : "—"
                                }
                            />

                            <MarketStat
                                label="Completed milestones"
                                value={
                                    String(
                                        completedMilestones.length
                                    )
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* ==========================
                    WORLD ID
                ========================== */}

                <div className="flex flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/15 p-6 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-4">

                        <ShieldCheck className="h-5 w-5" />

                        <div>

                            <p className="text-sm font-medium">
                                Verified Pair
                            </p>

                            <p className="mt-1 text-xs text-[#3D3B3A]/40">
                                Both members were verified before
                                this Pair was formed.
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/40">

                        <BadgeCheck className="h-4 w-4" />

                        2 verified humans

                    </div>

                </div>


                {/* ==========================
                    PAIR MARKET
                ========================== */}

                <section className="mt-12">

                    <div className="mb-6">

                        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[#3D3B3A]/35">
                            Pair market
                        </p>

                        <h2 className="font-serif text-4xl">
                            Bonding curve
                        </h2>

                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                            Before graduation,{" "}
                            {meta.token} trades inside
                            Stud&apos;s controlled
                            bonding-curve market.
                            Every quote below is read from
                            the deployed contract.
                        </p>

                    </div>


                    {!marketActive ||
                        !onchainPair?.market ? (

                        <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8">

                            <p className="text-xl font-medium">
                                Pair Market is not active yet.
                            </p>

                            <p className="mt-2 text-sm text-[#3D3B3A]/45">
                                Both Pair members must activate
                                the financial market before
                                investors can trade.
                            </p>

                        </div>

                    ) : (

                        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">


                            {/* ======================
                                CURVE
                            ====================== */}

                            <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-7 md:p-9">

                                <div className="mb-10 flex items-start justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                            Current Pair Token
                                        </p>

                                        <p className="mt-2 text-2xl font-medium">
                                            {meta.token}
                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-xs text-[#3D3B3A]/35">
                                            Current price
                                        </p>

                                        <p className="mt-1 text-2xl font-medium">
                                            $
                                            {
                                                price.toFixed(
                                                    2
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div className="relative h-[310px] overflow-hidden rounded-3xl bg-[#3D3B3A]/[0.025] p-5">

                                    <div className="absolute inset-x-5 top-[25%] border-t border-dashed border-[#3D3B3A]/10" />

                                    <div className="absolute inset-x-5 top-[50%] border-t border-dashed border-[#3D3B3A]/10" />

                                    <div className="absolute inset-x-5 top-[75%] border-t border-dashed border-[#3D3B3A]/10" />


                                    <svg
                                        viewBox="0 0 700 260"
                                        className="relative z-10 h-full w-full"
                                        preserveAspectRatio="none"
                                    >

                                        <defs>

                                            <linearGradient
                                                id="curveFill"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >

                                                <stop
                                                    offset="0%"
                                                    stopColor="#E2A9F1"
                                                    stopOpacity="0.55"
                                                />

                                                <stop
                                                    offset="100%"
                                                    stopColor="#E2A9F1"
                                                    stopOpacity="0"
                                                />

                                            </linearGradient>

                                        </defs>


                                        <path
                                            d="
                                                M 20 225
                                                C 150 220, 260 205, 360 175
                                                C 470 142, 565 93, 680 30
                                                L 680 250
                                                L 20 250
                                                Z
                                            "
                                            fill="url(#curveFill)"
                                        />

                                        <path
                                            d="
                                                M 20 225
                                                C 150 220, 260 205, 360 175
                                                C 470 142, 565 93, 680 30
                                            "
                                            fill="none"
                                            stroke="#3D3B3A"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                    </svg>


                                    <div className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                                        Token supply →
                                    </div>

                                    <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                                        Price ↑
                                    </div>

                                </div>


                                <div className="mt-8">

                                    <div className="mb-3 flex items-center justify-between text-xs">

                                        <span className="text-[#3D3B3A]/40">
                                            Market capacity used
                                        </span>

                                        <span>
                                            $
                                            {
                                                reserve.toLocaleString()
                                            }{" "}
                                            / $
                                            {
                                                capacity.toLocaleString()
                                            }
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                                        <div
                                            className="h-full rounded-full bg-[#3D3B3A]"
                                            style={{
                                                width:
                                                    `${capacity > 0
                                                        ? Math.min(
                                                            (
                                                                reserve /
                                                                capacity
                                                            ) *
                                                            100,
                                                            100
                                                        )
                                                        : 0
                                                    }%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-3 text-xs text-[#3D3B3A]/35">
                                        $
                                        {
                                            remainingCapacity.toLocaleString()
                                        }{" "}
                                        capacity remains at this reputation stage.
                                    </p>

                                </div>

                            </div>


                            {/* ======================
                                REAL TRADE
                            ====================== */}

                            <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-7">

                                <div className="mb-8 flex rounded-full bg-[#3D3B3A]/5 p-1">

                                    <button
                                        onClick={() =>
                                            setTradeMode(
                                                "buy"
                                            )
                                        }
                                        className={`flex-1 rounded-full py-3 text-sm font-medium transition ${tradeMode ===
                                            "buy"
                                            ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                            : "text-[#3D3B3A]/45"
                                            }`}
                                    >
                                        Buy
                                    </button>

                                    <button
                                        onClick={() =>
                                            setTradeMode(
                                                "sell"
                                            )
                                        }
                                        className={`flex-1 rounded-full py-3 text-sm font-medium transition ${tradeMode ===
                                            "sell"
                                            ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                            : "text-[#3D3B3A]/45"
                                            }`}
                                    >
                                        Sell
                                    </button>

                                </div>


                                <div className="mb-7">

                                    <div className="mb-3 flex items-center justify-between">

                                        <label className="text-xs uppercase tracking-[0.15em] text-[#3D3B3A]/35">
                                            Pair Tokens
                                        </label>

                                        <span className="text-xs text-[#3D3B3A]/35">
                                            Balance:{" "}
                                            {
                                                pairTokenBalance.toLocaleString()
                                            }
                                        </span>

                                    </div>


                                    <div className="flex items-center rounded-2xl border border-[#3D3B3A]/10 px-5">

                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                tradeAmount
                                            }
                                            disabled={
                                                trading
                                            }
                                            onChange={(event) =>
                                                setTradeAmount(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full bg-transparent py-5 text-2xl outline-none"
                                        />

                                        <span className="text-xs font-medium text-[#3D3B3A]/40">
                                            {
                                                meta.token
                                            }
                                        </span>

                                    </div>


                                    <div className="mt-3 flex gap-2">

                                        {[
                                            "1",
                                            "2",
                                            "5",
                                            "10",
                                        ].map(
                                            (
                                                value
                                            ) => (

                                                <button
                                                    key={
                                                        value
                                                    }
                                                    onClick={() =>
                                                        setTradeAmount(
                                                            value
                                                        )
                                                    }
                                                    className="rounded-full border border-[#3D3B3A]/10 px-3 py-2 text-xs text-[#3D3B3A]/50 transition hover:bg-[#3D3B3A] hover:text-white"
                                                >
                                                    {
                                                        value
                                                    }
                                                </button>

                                            )
                                        )}

                                    </div>

                                </div>


                                <div className="mb-7 rounded-3xl bg-[#E2A9F1]/20 p-5">

                                    <QuoteRow
                                        label="Current price"
                                        value={`$${price.toFixed(
                                            2
                                        )}`}
                                    />

                                    <QuoteRow
                                        label={
                                            tradeMode ===
                                                "buy"
                                                ? "Onchain cost"
                                                : "Onchain return"
                                        }
                                        value={
                                            quotedUsdc !==
                                                null
                                                ? `$${quotedUsdc.toFixed(
                                                    2
                                                )} USDC`
                                                : "—"
                                        }
                                    />

                                    <QuoteRow
                                        label="Your Pair Tokens"
                                        value={
                                            pairTokenBalance.toLocaleString()
                                        }
                                    />

                                    {tradeMode ===
                                        "buy" && (

                                            <QuoteRow
                                                label="Remaining capacity"
                                                value={`$${remainingCapacity.toLocaleString()}`}
                                            />

                                        )}

                                </div>


                                {exceedsCapacity && (

                                    <div className="mb-5 rounded-2xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/30 p-4 text-xs leading-relaxed text-[#3D3B3A]/60">
                                        This purchase would exceed
                                        the Pair&apos;s current
                                        market capacity.
                                    </div>

                                )}


                                <button
                                    disabled={
                                        trading ||
                                        !walletAddress ||
                                        quotedUsdc ===
                                        null ||
                                        exceedsCapacity ||
                                        Number(
                                            tradeAmount
                                        ) <= 0 ||
                                        !Number.isInteger(
                                            Number(
                                                tradeAmount
                                            )
                                        ) ||
                                        (
                                            tradeMode ===
                                            "sell" &&
                                            Number(
                                                tradeAmount
                                            ) >
                                            pairTokenBalance
                                        )
                                    }
                                    onClick={() =>
                                        void handleTrade()
                                    }
                                    className="group flex w-full items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                                >

                                    {
                                        trading
                                            ? "Confirming..."
                                            : tradeMode ===
                                                "buy"
                                                ? `Buy ${tradeAmount || "0"} ${meta.token}`
                                                : `Sell ${tradeAmount || "0"} ${meta.token}`
                                    }

                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">

                                        <ArrowUpRight className="h-4 w-4" />

                                    </span>

                                </button>


                                {tradeMessage && (

                                    <p className="mt-4 text-xs leading-relaxed text-[#3D3B3A]/50">
                                        {
                                            tradeMessage
                                        }
                                    </p>

                                )}


                                <p className="mt-5 text-xs leading-relaxed text-[#3D3B3A]/30">
                                    Quotes and execution come from
                                    the deployed Pair Market contract.
                                </p>

                            </div>

                        </div>
                    )}

                </section>


                {/* ==========================
                    PAIR PROGRESSION
                ========================== */}

                <section className="mt-20 pb-20">

                    <div className="mb-10">

                        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#3D3B3A]/35">
                            Pair progression
                        </p>

                        <h2 className="font-serif text-4xl md:text-5xl">
                            Reputation creates permission.
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                            Completed onchain milestones strengthen
                            the Pair&apos;s verified history.
                            Reputation unlocks larger economic
                            permissions but does not directly set
                            token price.
                        </p>

                    </div>


                    <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">


                        {/* REPUTATION */}

                        <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8">

                            <div className="mb-10 flex items-start justify-between">

                                <div>

                                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                        Pair reputation
                                    </p>

                                    <p className="text-6xl font-light">
                                        {
                                            reputation
                                        }

                                        <span className="ml-2 text-xl text-[#3D3B3A]/25">
                                            / 100
                                        </span>
                                    </p>

                                </div>

                                <span className="rounded-full border border-[#3D3B3A]/10 bg-[#E2A9F1]/25 px-4 py-2 text-xs">
                                    {stage}
                                </span>

                            </div>


                            <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                                <div
                                    className="h-full rounded-full bg-[#3D3B3A]"
                                    style={{
                                        width:
                                            `${Math.min(
                                                reputation,
                                                100
                                            )}%`,
                                    }}
                                />

                            </div>


                            <div className="flex justify-between text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">

                                <span>
                                    New
                                </span>

                                <span>
                                    Growing
                                </span>

                                <span>
                                    Established
                                </span>

                                <span>
                                    Graduation
                                </span>

                            </div>

                        </div>


                        {/* NEXT UNLOCK */}

                        <div className="rounded-[2.5rem] bg-[#3D3B3A] p-8 text-[#F2D8F8]">

                            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">

                                <LockKeyhole className="h-5 w-5" />

                            </div>

                            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#F2D8F8]/40">
                                Next unlock
                            </p>


                            {nextUnlock ? (
                                <>

                                    <p className="mb-3 font-serif text-4xl">
                                        Reputation{" "}
                                        {
                                            nextUnlock.reputation
                                        }
                                    </p>

                                    <p className="text-sm text-[#F2D8F8]/55">
                                        Reaching this level unlocks:
                                    </p>

                                    <p className="mt-2 text-xl font-medium">
                                        {
                                            nextUnlock.capacity
                                        }
                                    </p>

                                    <div className="mt-8">

                                        <div className="mb-2 flex justify-between text-xs text-[#F2D8F8]/40">

                                            <span>
                                                Current
                                            </span>

                                            <span>
                                                {
                                                    reputation
                                                }{" "}
                                                /{" "}
                                                {
                                                    nextUnlock.reputation
                                                }
                                            </span>

                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">

                                            <div
                                                className="h-full rounded-full bg-[#E2A9F1]"
                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            (
                                                                reputation /
                                                                nextUnlock.reputation
                                                            ) *
                                                            100,
                                                            100
                                                        )}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </>
                            ) : (
                                <>

                                    <p className="mb-3 font-serif text-4xl">
                                        Final reputation stage
                                    </p>

                                    <p className="text-sm text-[#F2D8F8]/55">
                                        This Pair satisfies the
                                        reputation side of graduation.
                                    </p>

                                </>
                            )}

                        </div>

                    </div>


                    {/* ======================
                        REAL MILESTONE HISTORY
                    ====================== */}

                    <div className="mb-8 rounded-[2.5rem] border border-[#3D3B3A]/10 p-8">

                        <div className="mb-8 flex items-end justify-between">

                            <div>

                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                    Verified history
                                </p>

                                <h3 className="font-serif text-3xl">
                                    Milestone history
                                </h3>

                            </div>

                            <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/35">

                                <Sparkles className="h-4 w-4" />

                                {
                                    completedMilestones.length
                                }{" "}
                                completed

                            </div>

                        </div>


                        {milestones.length ===
                            0 ? (

                            <p className="text-sm text-[#3D3B3A]/40">
                                This Pair has no milestones yet.
                            </p>

                        ) : (

                            <div className="divide-y divide-[#3D3B3A]/10">

                                {milestones.map(
                                    (
                                        milestone
                                    ) => {

                                        const completed =
                                            milestone.status ===
                                            2

                                        const status =
                                            milestone.status ===
                                                0
                                                ? "Proposed"
                                                : milestone.status ===
                                                    1
                                                    ? "Active"
                                                    : "Completed"

                                        return (
                                            <div
                                                key={
                                                    milestone.id.toString()
                                                }
                                                className="grid gap-5 py-6 md:grid-cols-[auto_1fr_auto] md:items-center"
                                            >

                                                <div
                                                    className={`flex h-11 w-11 items-center justify-center rounded-full ${completed
                                                        ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                                        : "border border-[#3D3B3A]/10"
                                                        }`}
                                                >

                                                    {completed ? (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    ) : (
                                                        <Circle className="h-5 w-5" />
                                                    )}

                                                </div>


                                                <div>

                                                    <div className="flex flex-wrap items-center gap-3">

                                                        <p className="font-medium">
                                                            {
                                                                milestone.title
                                                            }
                                                        </p>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${completed
                                                                ? "bg-[#E2A9F1]/30"
                                                                : "bg-[#3D3B3A]/5 text-[#3D3B3A]/45"
                                                                }`}
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </span>

                                                    </div>

                                                    <p className="mt-2 text-xs text-[#3D3B3A]/35">
                                                        Milestone #
                                                        {
                                                            milestone.id.toString()
                                                        }{" "}
                                                        · Proposed by{" "}
                                                        {
                                                            milestone.proposer.slice(
                                                                0,
                                                                6
                                                            )
                                                        }
                                                        ...
                                                        {
                                                            milestone.proposer.slice(
                                                                -4
                                                            )
                                                        }
                                                    </p>

                                                </div>


                                                <div className="text-left md:text-right">

                                                    <p className="text-lg font-medium">
                                                        +10
                                                    </p>

                                                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                                                        {
                                                            completed
                                                                ? "reputation earned"
                                                                : "on completion"
                                                        }
                                                    </p>

                                                </div>

                                            </div>
                                        )
                                    }
                                )}

                            </div>
                        )}

                    </div>


                    {/* ======================
                        GRADUATION
                    ====================== */}

                    <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8 md:p-10">

                        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">

                            <div>

                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#E2A9F1]/40">

                                    <Trophy className="h-5 w-5" />

                                </div>

                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                    Graduation
                                </p>

                                <h3 className="font-serif text-4xl">
                                    From controlled market
                                    <br />
                                    to open liquidity.
                                </h3>

                            </div>


                            <div
                                className={`rounded-full px-4 py-2 text-xs font-medium ${graduationEligible
                                    ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                    : "border border-[#3D3B3A]/10 text-[#3D3B3A]/45"
                                    }`}
                            >
                                {
                                    graduationEligible
                                        ? "Graduation eligible"
                                        : "Not eligible yet"
                                }
                            </div>

                        </div>


                        <div className="grid gap-8 md:grid-cols-2">

                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium">
                                            Social proof
                                        </p>

                                        <p className="mt-1 text-xs text-[#3D3B3A]/35">
                                            Pair reputation
                                        </p>

                                    </div>

                                    <p className="text-sm">
                                        {
                                            reputation
                                        }{" "}
                                        / 70
                                    </p>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                                    <div
                                        className="h-full rounded-full bg-[#3D3B3A]"
                                        style={{
                                            width:
                                                `${reputationGraduationProgress}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            <div>

                                <div className="mb-3 flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium">
                                            Market proof
                                        </p>

                                        <p className="mt-1 text-xs text-[#3D3B3A]/35">
                                            Bonding curve reserve
                                        </p>

                                    </div>

                                    <p className="text-sm">
                                        $
                                        {
                                            reserve.toLocaleString()
                                        }{" "}
                                        / $10,000
                                    </p>

                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                                    <div
                                        className="h-full rounded-full bg-[#E2A9F1]"
                                        style={{
                                            width:
                                                `${reserveGraduationProgress}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="mt-10 grid gap-3 border-t border-[#3D3B3A]/10 pt-8 md:grid-cols-3">

                            <GraduationRequirement
                                complete
                                label="Verified Pair"
                            />

                            <GraduationRequirement
                                complete={
                                    reputation >=
                                    70
                                }
                                label="Reputation ≥ 70"
                            />

                            <GraduationRequirement
                                complete={
                                    reserve >=
                                    10000
                                }
                                label="Reserve ≥ $10,000"
                            />

                        </div>


                        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-[#3D3B3A]/30">
                            Graduation requires both social proof
                            and market proof. Reputation alone
                            cannot graduate a Pair, and market
                            demand alone cannot bypass the
                            reputation requirement.
                        </p>

                    </div>

                </section>

            </div>

        </main>
    )
}


function MarketStat({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl bg-[#3D3B3A]/5 p-5">

            <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#3D3B3A]/35">
                {label}
            </p>

            <p className="text-xl font-medium">
                {value}
            </p>

        </div>
    )
}


function QuoteRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="flex items-center justify-between py-2">

            <span className="text-sm text-[#3D3B3A]/40">
                {label}
            </span>

            <span className="text-sm font-medium">
                {value}
            </span>

        </div>
    )
}


function GraduationRequirement({
    complete,
    label,
}: {
    complete: boolean
    label: string
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-[#3D3B3A]/[0.035] p-4">

            <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${complete
                    ? "bg-[#3D3B3A] text-[#E2A9F1]"
                    : "border border-[#3D3B3A]/15 text-[#3D3B3A]/25"
                    }`}
            >

                {complete ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <Circle className="h-4 w-4" />
                )}

            </div>

            <span className="text-sm">
                {label}
            </span>

        </div>
    )
}