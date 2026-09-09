"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowUpRight,
    BadgeCheck,
    BarChart3,
    HeartHandshake,
    Search,
    TrendingUp,
    Users,
} from "lucide-react"

type Tab = "studs" | "pairs"

const studs = [
    {
        id: "alice",
        name: "Alice",
        age: 24,
        location: "Bengaluru",
        occupation: "Designer",
        image: "/images/alice-profile.jpg",
        activeMarkets: 3,
        volume: "$1,840",
        topMarket: "Will Alice get a verified match this week?",
        yes: 0.62,
        no: 0.38,
    },
    {
        id: "Kai",
        name: "Kai",
        age: 26,
        location: "Mumbai",
        occupation: "Creative Director",
        image: "/images/profiles/kai.jpg",
        activeMarkets: 2,
        volume: "$980",
        topMarket: "Will Kai form a Pair before Sep 30?",
        yes: 0.47,
        no: 0.53,
    },
    {
        id: "noah",
        name: "Noah",
        age: 25,
        location: "Bengaluru",
        occupation: "Product Designer",
        image: "/images/profiles/noah.jpg",
        activeMarkets: 4,
        volume: "$2,420",
        topMarket: "Will Noah reach 3 verified matches this month?",
        yes: 0.71,
        no: 0.29,
    },
    {
        id: "leo",
        name: "Leo",
        age: 27,
        location: "Mumbai",
        occupation: "Founder",
        image: "/images/profiles/leo.jpg",
        activeMarkets: 2,
        volume: "$1,270",
        topMarket: "Will Leo form a new Pair this week?",
        yes: 0.56,
        no: 0.44,
    },
]

const pairs = [
    {
        id: "alice-leo",
        names: "Alice × Leo",
        token: "$ALICELEO",
        reputation: 20,
        stage: "Growing",
        capacity: "$2,000",
        price: "$0.42",
        change: "+18.4%",
        reserve: "$1,120",
    },
    {
        id: "Kai-noah",
        names: "Kai × Noah",
        token: "$KAINOAH",
        reputation: 57,
        stage: "Established",
        capacity: "$10,000",
        price: "$0.78",
        change: "+7.2%",
        reserve: "$6,840",
    },
    {
        id: "zara-kai",
        names: "Zara × Kai",
        token: "$ZARAKAI",
        reputation: 72,
        stage: "Graduation Eligible",
        capacity: "Open",
        price: "$1.14",
        change: "+31.7%",
        reserve: "$10,420",
    },
]

export default function InvestorPage() {
    const router = useRouter()

    const [tab, setTab] = useState<Tab>("studs")
    const [search, setSearch] = useState("")

    const filteredStuds = studs.filter((stud) =>
        stud.name.toLowerCase().includes(search.toLowerCase())
    )

    const filteredPairs = pairs.filter(
        (pair) =>
            pair.names.toLowerCase().includes(search.toLowerCase()) ||
            pair.token.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">
            {/* Header */}
            <header className="border-b border-[#3D3B3A]/10 px-6">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <div className="hidden items-center gap-2 rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs text-[#3D3B3A]/50 sm:flex">
                        <TrendingUp className="h-4 w-4" />
                        Investor Explorer
                    </div>

                    <button
                        onClick={() => router.push("/launch")}
                        className="text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A]"
                    >
                        Switch mode
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Intro */}
                <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div>
                        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/40">
                            Market Explorer
                        </p>

                        <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] md:text-6xl">
                            Discover people.
                            <br />
                            Follow the markets.
                        </h1>
                    </div>

                    <p className="max-w-md text-sm leading-relaxed text-[#3D3B3A]/50">
                        Explore verified Studs, trade objective social outcomes, and follow
                        Pair Tokens as reputation unlocks larger markets.
                    </p>
                </div>

                {/* Demo notice */}
                <div className="mb-8 rounded-2xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/20 px-5 py-3 text-xs text-[#3D3B3A]/50">
                    Demo environment · Profiles, prices and volumes below are illustrative.
                </div>

                {/* Overview metrics */}
                <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        icon={Users}
                        label="Verified Studs"
                        value="124"
                        detail="Unique humans"
                    />

                    <Metric
                        icon={BarChart3}
                        label="Active Markets"
                        value="38"
                        detail="Objective outcomes"
                    />

                    <Metric
                        icon={HeartHandshake}
                        label="Active Pairs"
                        value="21"
                        detail="Onchain identities"
                    />

                    <Metric
                        icon={TrendingUp}
                        label="Demo Volume"
                        value="$28.4K"
                        detail="Across markets"
                    />
                </div>

                {/* Explorer controls */}
                <div className="mb-8 flex flex-col gap-4 border-b border-[#3D3B3A]/10 pb-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-2 rounded-full bg-[#3D3B3A]/5 p-1">
                        <TabButton
                            active={tab === "studs"}
                            onClick={() => setTab("studs")}
                        >
                            Studs
                        </TabButton>

                        <TabButton
                            active={tab === "pairs"}
                            onClick={() => setTab("pairs")}
                        >
                            Pairs
                        </TabButton>
                    </div>

                    <div className="flex min-w-[280px] items-center gap-3 rounded-full border border-[#3D3B3A]/10 px-4 py-3">
                        <Search className="h-4 w-4 text-[#3D3B3A]/35" />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                tab === "studs"
                                    ? "Search verified Studs"
                                    : "Search Pairs or tokens"
                            }
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#3D3B3A]/30"
                        />
                    </div>
                </div>

                {/* STUDS */}
                {tab === "studs" && (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-medium">
                                    Verified Studs
                                </h2>

                                <p className="mt-1 text-sm text-[#3D3B3A]/45">
                                    Markets based on objective protocol outcomes.
                                </p>
                            </div>

                            <p className="text-xs text-[#3D3B3A]/35">
                                {filteredStuds.length} profiles
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {filteredStuds.map((stud, index) => (
                                <StudMarketCard
                                    key={stud.id}
                                    stud={stud}
                                    index={index}
                                    onClick={() =>
                                        router.push(`/investor/stud/${stud.id}`)
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* PAIRS */}
                {tab === "pairs" && (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-medium">
                                    Pair Markets
                                </h2>

                                <p className="mt-1 text-sm text-[#3D3B3A]/45">
                                    Persistent Pair Tokens trading through Stud.
                                </p>
                            </div>

                            <p className="text-xs text-[#3D3B3A]/35">
                                {filteredPairs.length} pairs
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPairs.map((pair, index) => (
                                <PairCard
                                    key={pair.id}
                                    pair={pair}
                                    index={index}
                                    onClick={() =>
                                        router.push(`/investor/pair/${pair.id}`)
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}

function Metric({
    icon: Icon,
    label,
    value,
    detail,
}: {
    icon: typeof Users
    label: string
    value: string
    detail: string
}) {
    return (
        <div className="rounded-3xl border border-[#3D3B3A]/10 p-5">
            <div className="mb-8 flex items-center justify-between">
                <Icon
                    className="h-5 w-5 text-[#3D3B3A]/50"
                    strokeWidth={1.5}
                />

                <span className="text-[10px] uppercase tracking-[0.16em] text-[#3D3B3A]/30">
                    Live
                </span>
            </div>

            <p className="text-3xl font-light">
                {value}
            </p>

            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#3D3B3A]/40">
                {label}
            </p>

            <p className="mt-1 text-xs text-[#3D3B3A]/30">
                {detail}
            </p>
        </div>
    )
}

function TabButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-5 py-2 text-sm transition ${active
                ? "bg-[#3D3B3A] text-[#F2D8F8]"
                : "text-[#3D3B3A]/50 hover:text-[#3D3B3A]"
                }`}
        >
            {children}
        </button>
    )
}

function StudMarketCard({
    stud,
    index,
    onClick,
}: {
    stud: (typeof studs)[number]
    index: number
    onClick: () => void
}) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group overflow-hidden rounded-[2rem] border border-[#3D3B3A]/10 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="grid sm:grid-cols-[180px_1fr]">
                {/* Profile */}
                <div className="relative min-h-[230px] overflow-hidden bg-[#E2A9F1]">
                    <img
                        src={stud.image}
                        alt={stud.name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-1.5">
                            <p className="text-lg font-medium">
                                {stud.name}, {stud.age}
                            </p>

                            <BadgeCheck className="h-4 w-4" />
                        </div>

                        <p className="mt-1 text-xs text-white/65">
                            {stud.location}
                        </p>
                    </div>
                </div>

                {/* Market */}
                <div className="p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                Top market
                            </p>

                            <p className="mt-2 max-w-sm text-base font-medium leading-snug">
                                {stud.topMarket}
                            </p>
                        </div>

                        <ArrowUpRight className="h-4 w-4 text-[#3D3B3A]/30 transition group-hover:text-[#3D3B3A]" />
                    </div>

                    {/* YES NO */}
                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#E2A9F1]/35 p-4">
                            <p className="text-xs text-[#3D3B3A]/40">
                                YES
                            </p>

                            <p className="mt-1 text-2xl font-medium">
                                ${stud.yes.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[#3D3B3A]/5 p-4">
                            <p className="text-xs text-[#3D3B3A]/40">
                                NO
                            </p>

                            <p className="mt-1 text-2xl font-medium">
                                ${stud.no.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#3D3B3A]/10 pt-4 text-xs text-[#3D3B3A]/40">
                        <span>
                            {stud.activeMarkets} active markets
                        </span>

                        <span>
                            {stud.volume} volume
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    )
}

function PairCard({
    pair,
    index,
    onClick,
}: {
    pair: (typeof pairs)[number]
    index: number
    onClick: () => void
}) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="group rounded-[2rem] border border-[#3D3B3A]/10 p-6 text-left transition-all hover:-translate-y-1 hover:bg-[#E2A9F1]/15 hover:shadow-lg"
        >
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                        Pair Token
                    </p>

                    <h3 className="mt-2 text-xl font-medium">
                        {pair.names}
                    </h3>

                    <p className="mt-1 text-sm text-[#3D3B3A]/40">
                        {pair.token}
                    </p>
                </div>

                <span className="rounded-full border border-[#3D3B3A]/10 px-3 py-1.5 text-[10px] text-[#3D3B3A]/45">
                    {pair.stage}
                </span>
            </div>

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <p className="text-xs text-[#3D3B3A]/35">
                        Price
                    </p>

                    <p className="mt-1 text-3xl font-light">
                        {pair.price}
                    </p>
                </div>

                <p className="text-sm font-medium">
                    {pair.change}
                </p>
            </div>

            <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs">
                    <span className="text-[#3D3B3A]/40">
                        Reputation
                    </span>

                    <span>
                        {pair.reputation}/100
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

            <div className="grid grid-cols-2 gap-3 border-t border-[#3D3B3A]/10 pt-5">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                        Reserve
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {pair.reserve}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                        Capacity
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {pair.capacity}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
                <span>
                    Open market
                </span>

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
        </motion.button>
    )
}