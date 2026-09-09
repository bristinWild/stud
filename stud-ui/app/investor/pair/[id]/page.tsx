"use client"

import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    HeartHandshake,
    ShieldCheck,
    TrendingUp,
} from "lucide-react"
import { useState } from "react"

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

        stage: "Growing Pair",

        reputation: 20,

        price: 0.42,
        change24h: 18.4,

        reserve: 1120,
        capacity: 2000,

        milestones: 2,
    },

    "Kai-noah": {
        id: "Kai-noah",

        names: "Kai × Noah",
        token: "$KaiNOAH",

        userA: {
            name: "Kai",
            image: "/images/profiles/Kai.jpg",
        },

        userB: {
            name: "Noah",
            image: "/images/profiles/noah.jpg",
        },

        stage: "Established Pair",

        reputation: 57,

        price: 0.78,
        change24h: 7.2,

        reserve: 6840,
        capacity: 10000,

        milestones: 6,
    },

    "zara-kai": {
        id: "zara-kai",

        names: "Zara × Kai",
        token: "$ZARAKAI",

        userA: {
            name: "Zara",
            image: "/images/profiles/zara.jpg",
        },

        userB: {
            name: "Kai",
            image: "/images/profiles/kai.jpg",
        },

        stage: "Graduation Eligible",

        reputation: 72,

        price: 1.14,
        change24h: 31.7,

        reserve: 10420,
        capacity: 10000,

        milestones: 8,
    },
}



export default function PairMarketPage() {
    const router = useRouter()


    const params = useParams<{
        id: string
    }>()

    const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy")
    const [tradeAmount, setTradeAmount] = useState("50")


    const pair =
        pairData[
        params.id as keyof typeof pairData
        ] ?? pairData["alice-leo"]

    const remainingCapacity = Math.max(
        pair.capacity - pair.reserve,
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

                {/* PAIR HERO */}
                <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">

                    {/* LEFT */}
                    <div>
                        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/40">
                            Pair Token
                        </p>

                        {/* Avatars */}
                        <div className="mb-8 flex items-center">

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

                        <p className="mb-6 text-lg text-[#3D3B3A]/45">
                            {pair.token}
                        </p>

                        <div className="inline-flex items-center rounded-full border border-[#3D3B3A]/10 bg-[#E2A9F1]/25 px-4 py-2 text-xs">
                            {pair.stage}
                        </div>

                        <p className="mt-8 max-w-xl text-sm leading-relaxed text-[#3D3B3A]/50">
                            A persistent market around the shared
                            onchain identity created by {pair.userA.name} and{" "}
                            {pair.userB.name}. Reputation controls
                            protocol permissions while market demand
                            determines token price.
                        </p>
                    </div>

                    {/* RIGHT — PRICE */}
                    <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8 md:p-10">

                        <div className="mb-12 flex items-start justify-between">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                    Current price
                                </p>

                                <p className="text-6xl font-light tracking-tight">
                                    ${pair.price.toFixed(2)}
                                </p>
                            </div>

                            <div className="rounded-full bg-[#E2A9F1]/40 px-4 py-2 text-sm font-medium">
                                +{pair.change24h}%
                            </div>
                        </div>

                        {/* Reputation */}
                        <div className="mb-10">
                            <div className="mb-3 flex items-center justify-between text-sm">
                                <span className="text-[#3D3B3A]/45">
                                    Pair reputation
                                </span>

                                <span>
                                    {pair.reputation} / 100
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">
                                <div
                                    className="h-full rounded-full bg-[#3D3B3A]"
                                    style={{
                                        width: `${pair.reputation}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">

                            <MarketStat
                                label="Reserve"
                                value={`$${pair.reserve.toLocaleString()}`}
                            />

                            <MarketStat
                                label="Market capacity"
                                value={`$${pair.capacity.toLocaleString()}`}
                            />

                            <MarketStat
                                label="Remaining"
                                value={`$${remainingCapacity.toLocaleString()}`}
                            />

                            <MarketStat
                                label="Milestones"
                                value={String(pair.milestones)}
                            />
                        </div>
                    </div>
                </div>

                {/* VERIFICATION STRIP */}
                <div className="flex flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/15 p-6 sm:flex-row sm:items-center">

                    <div className="flex items-center gap-4">

                        <ShieldCheck className="h-5 w-5" />

                        <div>
                            <p className="text-sm font-medium">
                                Verified Pair
                            </p>

                            <p className="mt-1 text-xs text-[#3D3B3A]/40">
                                Both members were World ID–verified
                                before this Pair was formed.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/40">
                        <BadgeCheck className="h-4 w-4" />

                        2 verified humans
                    </div>
                </div>

                <BondingCurveTrading
                    pair={pair}
                    remainingCapacity={remainingCapacity}
                    tradeMode={tradeMode}
                    setTradeMode={setTradeMode}
                    tradeAmount={tradeAmount}
                    setTradeAmount={setTradeAmount}
                />
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

function BondingCurveTrading({
    pair,
    remainingCapacity,
    tradeMode,
    setTradeMode,
    tradeAmount,
    setTradeAmount,
}: {
    pair: {
        token: string
        price: number
        reserve: number
        capacity: number
    }
    remainingCapacity: number
    tradeMode: "buy" | "sell"
    setTradeMode: (mode: "buy" | "sell") => void
    tradeAmount: string
    setTradeAmount: (value: string) => void
}) {
    const amount = Number(tradeAmount) || 0

    const estimatedTokens =
        tradeMode === "buy" && pair.price > 0
            ? amount / pair.price
            : 0

    const estimatedProceeds =
        tradeMode === "sell"
            ? amount * pair.price
            : 0

    const capacityUsed =
        Math.min((pair.reserve / pair.capacity) * 100, 100)

    const exceedsCapacity =
        tradeMode === "buy" && amount > remainingCapacity

    return (
        <section className="mt-12">
            <div className="mb-6">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[#3D3B3A]/35">
                    Pair market
                </p>

                <h2 className="font-serif text-4xl text-[#3D3B3A]">
                    Bonding curve
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                    Before graduation, {pair.token} trades inside Stud&apos;s controlled
                    bonding-curve market. Buying increases demand along the curve;
                    selling moves back down it.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

                {/* ======================
            BONDING CURVE CHART
        ======================= */}
                <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-7 md:p-9">
                    <div className="mb-10 flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                Current Pair Token
                            </p>

                            <p className="mt-2 text-2xl font-medium">
                                {pair.token}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-[#3D3B3A]/35">
                                Current price
                            </p>

                            <p className="mt-1 text-2xl font-medium">
                                ${pair.price.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-[310px] overflow-hidden rounded-3xl bg-[#3D3B3A]/[0.025] p-5">
                        {/* Horizontal guide lines */}
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

                            {/* Fill */}
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

                            {/* Curve */}
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

                            {/* Current point */}
                            <circle
                                cx="430"
                                cy="155"
                                r="8"
                                fill="#E2A9F1"
                                stroke="#3D3B3A"
                                strokeWidth="3"
                            />

                            <circle
                                cx="430"
                                cy="155"
                                r="16"
                                fill="#E2A9F1"
                                opacity="0.25"
                            />
                        </svg>

                        <div className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                            Token supply →
                        </div>

                        <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                            Price ↑
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="mt-8">
                        <div className="mb-3 flex items-center justify-between text-xs">
                            <span className="text-[#3D3B3A]/40">
                                Market capacity used
                            </span>

                            <span>
                                ${pair.reserve.toLocaleString()} / $
                                {pair.capacity.toLocaleString()}
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">
                            <div
                                className="h-full rounded-full bg-[#3D3B3A]"
                                style={{
                                    width: `${capacityUsed}%`,
                                }}
                            />
                        </div>

                        <p className="mt-3 text-xs text-[#3D3B3A]/35">
                            ${remainingCapacity.toLocaleString()} capacity remains at this
                            reputation stage.
                        </p>
                    </div>
                </div>

                {/* ======================
            TRADE PANEL
        ======================= */}
                <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-7">
                    <div className="mb-8 flex rounded-full bg-[#3D3B3A]/5 p-1">
                        <button
                            onClick={() => setTradeMode("buy")}
                            className={`flex-1 rounded-full py-3 text-sm font-medium transition ${tradeMode === "buy"
                                ? "bg-[#3D3B3A] text-[#E2A9F1]"
                                : "text-[#3D3B3A]/45"
                                }`}
                        >
                            Buy
                        </button>

                        <button
                            onClick={() => setTradeMode("sell")}
                            className={`flex-1 rounded-full py-3 text-sm font-medium transition ${tradeMode === "sell"
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
                                {tradeMode === "buy"
                                    ? "You pay"
                                    : "You sell"}
                            </label>

                            <span className="text-xs text-[#3D3B3A]/35">
                                Demo balance
                            </span>
                        </div>

                        <div className="flex items-center rounded-2xl border border-[#3D3B3A]/10 px-5">
                            <span className="text-xl text-[#3D3B3A]/35">
                                {tradeMode === "buy" ? "$" : ""}
                            </span>

                            <input
                                type="number"
                                min="0"
                                value={tradeAmount}
                                onChange={(event) =>
                                    setTradeAmount(event.target.value)
                                }
                                className="w-full bg-transparent px-2 py-5 text-2xl outline-none"
                            />

                            <span className="text-xs font-medium text-[#3D3B3A]/40">
                                {tradeMode === "buy"
                                    ? "USDC"
                                    : pair.token}
                            </span>
                        </div>

                        {/* Quick values */}
                        <div className="mt-3 flex gap-2">
                            {["10", "25", "50", "100"].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setTradeAmount(value)}
                                    className="rounded-full border border-[#3D3B3A]/10 px-3 py-2 text-xs text-[#3D3B3A]/50 transition hover:bg-[#3D3B3A] hover:text-white"
                                >
                                    {tradeMode === "buy" ? `$${value}` : value}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="mb-7 rounded-3xl bg-[#E2A9F1]/20 p-5">
                        {tradeMode === "buy" ? (
                            <>
                                <QuoteRow
                                    label="Current price"
                                    value={`$${pair.price.toFixed(2)}`}
                                />

                                <QuoteRow
                                    label="You receive"
                                    value={`${estimatedTokens.toFixed(2)} ${pair.token}`}
                                />

                                <QuoteRow
                                    label="Remaining capacity"
                                    value={`$${remainingCapacity.toLocaleString()}`}
                                />
                            </>
                        ) : (
                            <>
                                <QuoteRow
                                    label="Current price"
                                    value={`$${pair.price.toFixed(2)}`}
                                />

                                <QuoteRow
                                    label="Estimated proceeds"
                                    value={`$${estimatedProceeds.toFixed(2)} USDC`}
                                />
                            </>
                        )}
                    </div>

                    {exceedsCapacity && (
                        <div className="mb-5 rounded-2xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/30 p-4 text-xs leading-relaxed text-[#3D3B3A]/60">
                            This purchase exceeds the Pair&apos;s current market capacity.
                            More capacity unlocks as Pair reputation grows.
                        </div>
                    )}

                    <button
                        disabled={
                            amount <= 0 ||
                            exceedsCapacity
                        }
                        className="group flex w-full items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        {tradeMode === "buy"
                            ? `Buy ${pair.token}`
                            : `Sell ${pair.token}`}

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                            <ArrowUpRight className="h-4 w-4" />
                        </span>
                    </button>

                    <p className="mt-5 text-xs leading-relaxed text-[#3D3B3A]/30">
                        Demo quote only. The production market will calculate the exact
                        bonding-curve execution price, fees, and slippage onchain.
                    </p>
                </div>
            </div>
        </section>
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