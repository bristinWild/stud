"use client"
import {
    useEffect,
    useMemo,
    useState,
} from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    BarChart3,
    CalendarDays,
    Check,
    Clock,
    MapPin,
    ShieldCheck,
    TrendingUp,
    Users,
    X,
} from "lucide-react"

import {
    formatUnits,
    type Address,
} from "viem"

import {
    claimPredictionWinnings,
    placePredictionPosition,
} from "@/lib/prediction-market"

type Outcome = "YES" | "NO"

type Market = {
    address: Address
    question: string
    yesPercent: number
    noPercent: number
    yesPool: number
    noPool: number
    volume: number
    ends: string
    status:
    | "Live"
    | "Closed"
    | "Resolved"
    outcome:
    | "unresolved"
    | "yes"
    | "no"
}

const studData = {
    alice: {
        id: "alice",
        onchainStudId: 1,
        name: "Alice",
        age: 24,
        occupation: "Designer",
        location: "Bengaluru",
        image: "/images/alice-profile.jpg",
        verified: true,
        joined: "September 2026",
        matches: 2,
    },

    Kai: {
        id: "Kai",
        onchainStudId: null,
        name: "Kai",
        age: 26,
        occupation: "Creative Director",
        location: "Mumbai",
        image: "/images/profiles/Kai.jpg",
        verified: true,
        joined: "September 2026",
        matches: 1,
        markets: [],
    },

    noah: {
        id: "noah",
        onchainStudId: null,
        name: "Noah",
        age: 25,
        occupation: "Product Designer",
        location: "Bengaluru",
        image: "/images/profiles/noah.jpg",
        verified: true,
        joined: "September 2026",
        matches: 3,
        markets: [],
    },

    leo: {
        id: "leo",
        onchainStudId: null,
        name: "Leo",
        age: 27,
        occupation: "Founder",
        location: "Mumbai",
        image: "/images/profiles/leo.jpg",
        verified: true,
        joined: "September 2026",
        matches: 2,
        markets: [],
    },
}

export default function StudMarketPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()

    const stud =
        studData[params.id as keyof typeof studData] ?? studData.alice

    const [selectedMarket, setSelectedMarket] =
        useState<Market | null>(null)

    const [selectedOutcome, setSelectedOutcome] =
        useState<Outcome>("YES")

    const [amount, setAmount] = useState("25")

    const [markets, setMarkets] =
        useState<Market[]>([])

    const [loadingMarkets, setLoadingMarkets] =
        useState(true)

    const [txMessage, setTxMessage] =
        useState("")

    const [submitting, setSubmitting] =
        useState(false)

    async function handleTrade(
        market: Market,
        outcome: Outcome,
        amount: string
    ) {
        try {
            setSubmitting(true)
            setTxMessage(
                "Waiting for wallet..."
            )

            await placePredictionPosition(
                market.address,
                amount,
                outcome
            )

            setTxMessage(
                `${outcome} position confirmed onchain.`
            )

            await loadMarkets()

            setSelectedMarket(null)
        } catch (error) {
            setTxMessage(
                error instanceof Error
                    ? error.message
                    : "Transaction failed."
            )
        } finally {
            setSubmitting(false)
        }
    }

    const backendUrl =
        process.env
            .NEXT_PUBLIC_BACKEND_URL ??
        "http://localhost:3001"

    async function loadMarkets() {
        if (!stud.onchainStudId) {
            setMarkets([])
            setLoadingMarkets(false)
            return
        }

        setLoadingMarkets(true)

        try {
            const response =
                await fetch(
                    `${backendUrl}/onchain/stud/${stud.onchainStudId}/prediction-markets`,
                    {
                        cache: "no-store",
                    }
                )

            if (!response.ok) {
                throw new Error(
                    "Could not load markets."
                )
            }

            const data =
                await response.json()

            const parsed: Market[] =
                data.markets.map(
                    (market: any) => {
                        const closesAt =
                            Number(
                                market.closesAt
                            )

                        const isResolved =
                            market.outcome.label !==
                            "unresolved"

                        const isClosed =
                            closesAt <=
                            Math.floor(
                                Date.now() /
                                1000
                            )

                        return {
                            address:
                                market.address,

                            question:
                                market.question,

                            yesPercent:
                                market
                                    .probabilities
                                    .yesPercent,

                            noPercent:
                                market
                                    .probabilities
                                    .noPercent,

                            yesPool:
                                Number(
                                    formatUnits(
                                        BigInt(
                                            market
                                                .pools
                                                .yes
                                        ),
                                        6
                                    )
                                ),

                            noPool:
                                Number(
                                    formatUnits(
                                        BigInt(
                                            market
                                                .pools
                                                .no
                                        ),
                                        6
                                    )
                                ),

                            volume:
                                Number(
                                    formatUnits(
                                        BigInt(
                                            market
                                                .pools
                                                .total
                                        ),
                                        6
                                    )
                                ),

                            ends:
                                new Date(
                                    closesAt *
                                    1000
                                ).toLocaleString(),

                            status:
                                isResolved
                                    ? "Resolved"
                                    : isClosed
                                        ? "Closed"
                                        : "Live",

                            outcome:
                                market.outcome
                                    .label,
                        }
                    }
                )

            setMarkets(
                parsed.reverse()
            )
        } finally {
            setLoadingMarkets(false)
        }
    }

    useEffect(() => {
        void loadMarkets()
    }, [stud.onchainStudId])

    const totalVolume = markets.reduce(
        (total, market) => total + market.volume,
        0
    )

    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">

            {/* HEADER */}
            <header className="border-b border-[#3D3B3A]/10 px-6">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">

                    <button
                        onClick={() => router.push("/investor")}
                        className="flex items-center gap-2 text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Markets
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/45">
                        <TrendingUp className="h-4 w-4" />
                        Investor
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">

                {/* PROFILE HEADER */}
                <div className="mb-14 grid gap-10 lg:grid-cols-[300px_1fr]">

                    {/* IMAGE */}
                    <div className="relative h-[370px] overflow-hidden rounded-[2.2rem] bg-[#E2A9F1]">
                        <img
                            src={stud.image}
                            alt={stud.name}
                            className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-medium">
                                    {stud.name}, {stud.age}
                                </h1>

                                {stud.verified && (
                                    <BadgeCheck className="h-5 w-5" />
                                )}
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                                <MapPin className="h-4 w-4" />
                                {stud.location}
                            </div>
                        </div>
                    </div>

                    {/* PROFILE INFO */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/40">
                                Verified Stud
                            </p>

                            <h2 className="mb-5 max-w-3xl font-serif text-5xl leading-[0.95] md:text-6xl">
                                Markets around
                                <br />
                                {stud.name}.
                            </h2>

                            <p className="max-w-2xl text-base leading-relaxed text-[#3D3B3A]/50">
                                Take positions on objective social outcomes that resolve using
                                Stud&apos;s verified protocol state.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <ProfileMetric
                                label="Active Markets"
                                value={String(markets.length)}
                            />

                            <ProfileMetric
                                label="Market Volume"
                                value={`$${totalVolume.toLocaleString()}`}
                            />

                            <ProfileMetric
                                label="Verified Matches"
                                value={String(stud.matches)}
                            />
                        </div>
                    </div>
                </div>

                {/* WORLD ID STRIP */}
                <div className="mb-12 flex flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/20 p-6 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-4">

                        <ShieldCheck className="h-5 w-5" />


                        <div>
                            <p className="text-sm font-medium">
                                World ID verified human
                            </p>

                            <p className="mt-1 text-xs text-[#3D3B3A]/40">
                                Unique-human verification helps protect these markets from
                                duplicate identities.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/45">
                        <Check className="h-4 w-4" />
                        Verified
                    </div>
                </div>

                {/* MARKET TITLE */}
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                            Live markets
                        </p>

                        <h2 className="text-2xl font-medium">
                            Objective outcomes
                        </h2>
                    </div>

                    <p className="text-xs text-[#3D3B3A]/35">
                        {markets.length} markets
                    </p>
                </div>

                {/* MARKETS */}
                <div className="space-y-4">
                    {markets.map((market, index) => (
                        <MarketRow
                            key={market.id}
                            market={market}
                            index={index}
                            onTrade={(outcome) => {
                                setSelectedMarket(market)
                                setSelectedOutcome(outcome)
                            }}
                        />
                    ))}

                    {markets.length === 0 && (
                        <div className="rounded-[2rem] border border-[#3D3B3A]/10 py-20 text-center">
                            <p className="font-serif text-3xl">
                                No active markets yet.
                            </p>

                            <p className="mt-3 text-sm text-[#3D3B3A]/40">
                                New objective markets will appear as activity develops.
                            </p>
                        </div>
                    )}
                </div>

                {/* FOOTNOTE */}
                <div className="mt-10 border-t border-[#3D3B3A]/10 pt-6">
                    <p className="max-w-3xl text-xs leading-relaxed text-[#3D3B3A]/35">
                        Demo market data is illustrative. Stud markets resolve using
                        objective protocol events, not subjective claims about emotions,
                        relationships, or personal behavior.
                    </p>
                </div>
            </div>

            {/* TRADE PANEL */}
            <AnimatePresence>
                {selectedMarket && (
                    <TradePanel
                        market={selectedMarket}
                        outcome={selectedOutcome}
                        amount={amount}
                        setAmount={setAmount}
                        setOutcome={setSelectedOutcome}
                        onClose={() =>
                            setSelectedMarket(null)
                        }
                        onTrade={handleTrade}
                        loading={submitting}
                    />
                )}
            </AnimatePresence>
        </main>
    )
}

function ProfileMetric({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-[#3D3B3A]/10 p-5">
            <p className="text-2xl font-light">
                {value}
            </p>

            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                {label}
            </p>
        </div>
    )
}

function MarketRow({
    market,
    index,
    onTrade,
}: {
    market: Market
    index: number
    onTrade: (
        market: Market,
        outcome: Outcome,
        amount: string
    ) => Promise<void>

    loading: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[2rem] border border-[#3D3B3A]/10 p-6 transition hover:bg-[#E2A9F1]/10"
        >
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">

                {/* QUESTION */}
                <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#3D3B3A]/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/45">
                            {market.status}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-[#3D3B3A]/35">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {market.ends}
                        </div>
                    </div>

                    <h3 className="max-w-3xl text-lg font-medium leading-snug md:text-xl">
                        {market.question}
                    </h3>

                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#3D3B3A]/45">
                        {market.description}
                    </p>


                </div>

                {/* PRICES */}
                <div className="grid min-w-[270px] grid-cols-2 gap-3">
                    <button
                        disabled={
                            loading ||
                            numericAmount <= 0
                        }
                        onClick={() =>
                            void onTrade(
                                market,
                                outcome,
                                amount
                            )
                        }
                        className="flex w-full items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Confirming..."
                            : `Stake $${numericAmount.toFixed(2)} on ${outcome}`}

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                            <ArrowUpRight className="h-4 w-4" />
                        </span>
                    </button>

                    <button
                        onClick={() => onTrade("NO")}
                        className="group rounded-2xl bg-[#3D3B3A]/5 p-5 text-left transition hover:bg-[#3D3B3A] hover:text-white"
                    >
                        <p className="text-xs opacity-50">
                            NO
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-2xl font-medium">
                                {market.noPercent.toFixed(0)}%
                            </p>

                            <ArrowUpRight className="h-4 w-4 opacity-30 transition group-hover:opacity-100" />
                        </div>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function TradePanel({
    market,
    outcome,
    amount,
    setAmount,
    setOutcome,
    onClose,
}: {
    market: Market
    outcome: Outcome
    amount: string
    setAmount: (value: string) => void
    setOutcome: (value: Outcome) => void
    onClose: () => void
}) {
    const numericAmount = Number(amount) || 0

    const probability =
        outcome === "YES"
            ? market.yesPercent
            : market.noPercent

    const outcomePool =
        outcome === "YES"
            ? market.yesPool
            : market.noPool

    return (
        <>
            {/* Overlay */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                }}
                className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-[460px] overflow-y-auto bg-background p-7 shadow-2xl"
            >
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                            Take position
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3D3B3A]/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h2 className="mb-7 text-xl font-medium leading-snug">
                    {market.question}
                </h2>

                {/* OUTCOME */}
                <div className="mb-8 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setOutcome("YES")}
                        className={`rounded-2xl p-5 text-left transition ${outcome === "YES"
                            ? "bg-[#E2A9F1]"
                            : "border border-[#3D3B3A]/10"
                            }`}
                    >
                        <p className="text-xs opacity-50">
                            YES
                        </p>

                        <p className="mt-2 text-2xl font-medium">
                            ${market.yes.toFixed(2)}
                        </p>
                    </button>

                    <button
                        onClick={() => setOutcome("NO")}
                        className={`rounded-2xl p-5 text-left transition ${outcome === "NO"
                            ? "bg-[#3D3B3A] text-white"
                            : "border border-[#3D3B3A]/10"
                            }`}
                    >
                        <p className="text-xs opacity-50">
                            NO
                        </p>

                        <p className="mt-2 text-2xl font-medium">
                            ${market.no.toFixed(2)}
                        </p>
                    </button>
                </div>

                {/* AMOUNT */}
                <div className="mb-7">
                    <label className="mb-3 block text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/40">
                        Investment amount
                    </label>

                    <div className="flex items-center rounded-2xl border border-[#3D3B3A]/10 px-5">
                        <span className="text-lg text-[#3D3B3A]/40">
                            $
                        </span>

                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            type="number"
                            min="1"
                            className="w-full bg-transparent px-2 py-5 text-2xl outline-none"
                        />

                        <span className="text-xs text-[#3D3B3A]/35">
                            USDC
                        </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                        {["10", "25", "50", "100"].map((value) => (
                            <button
                                key={value}
                                onClick={() => setAmount(value)}
                                className="rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs transition hover:bg-[#3D3B3A] hover:text-white"
                            >
                                ${value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CALCULATION */}
                <div className="mb-8 rounded-3xl bg-[#3D3B3A]/5 p-5">
                    <TradeStat
                        label="Current probability"
                        value={`${probability.toFixed(0)}%`}
                    />

                    <TradeStat
                        label={`${outcome} pool`}
                        value={`$${outcomePool.toLocaleString()}`}
                    />

                    <TradeStat
                        label="Your stake"
                        value={`$${numericAmount.toFixed(2)}`}
                    />

                    <div className="mt-4 border-t border-[#3D3B3A]/10 pt-4">
                        <p className="text-xs leading-relaxed text-[#3D3B3A]/40">
                            If {outcome} wins, your payout is calculated
                            proportionally from the final total pool.
                            The exact payout can change as more positions
                            are added before closing.
                        </p>
                    </div>
                </div>

                {/* BUY */}
                <button
                    className="flex w-full items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1]"
                >
                    Buy {outcome}

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                        <ArrowUpRight className="h-4 w-4" />
                    </span>
                </button>

                <div className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-[#3D3B3A]/35">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" />

                    <p>
                        Your USDC is deposited directly into the
                        onchain {outcome} pool. If that outcome
                        resolves as the winner, you can claim your
                        proportional share of the final market pool.
                    </p>
                </div>
            </motion.aside>
        </>
    )
}

function TradeStat({
    label,
    value,
    strong = false,
}: {
    label: string
    value: string
    strong?: boolean
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#3D3B3A]/45">
                {label}
            </span>

            <span
                className={
                    strong
                        ? "font-medium"
                        : "text-sm"
                }
            >
                {value}
            </span>
        </div>
    )
}