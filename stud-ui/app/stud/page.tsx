"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowUpRight,
    BadgeCheck,
    Bell,
    Heart,
    HeartHandshake,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react"

const currentStud = {
    name: "Alice",
    age: 24,
    location: "Bengaluru",
    occupation: "Designer",
    image: "/images/alice-profile.jpg",
    verified: true,
    verifiedMatches: 4,
}

const pairs = [
    {
        id: "alice-leo",
        names: "Alice × Leo",
        token: "$ALICELEO",
        otherName: "Leo",
        otherImage: "/images/profiles/leo.jpg",
        reputation: 20,
        stage: "Growing Pair",
        capacity: "$2,000",
        pendingActions: 2,
    },
    {
        id: "alice-noah",
        names: "Alice × Noah",
        token: "$ALICENOAH",
        otherName: "Noah",
        otherImage: "/images/profiles/noah.jpg",
        reputation: 40,
        stage: "Growing Pair",
        capacity: "$2,000",
        pendingActions: 1,
    },
]

const matches = [
    {
        id: "leo",
        name: "Leo",
        age: 27,
        image: "/images/profiles/leo.jpg",
        status: "Pair created",
    },
    {
        id: "noah",
        name: "Noah",
        age: 25,
        image: "/images/profiles/noah.jpg",
        status: "Pair created",
    },
    {
        id: "kai",
        name: "Kai",
        age: 24,
        image: "/images/profiles/kai.jpg",
        status: "New match",
    },
    {
        id: "theo",
        name: "Theo",
        age: 26,
        image: "/images/profiles/theo.jpg",
        status: "New match",
    },
]

const pendingActions = [
    {
        id: 1,
        pairId: "alice-leo",
        pair: "Alice × Leo",
        title: "Coffee challenge",
        description: "Leo is waiting for your response.",
        type: "Milestone proposal",
    },
    {
        id: 2,
        pairId: "alice-leo",
        pair: "Alice × Leo",
        title: "Seven-day activity streak",
        description: "Review and accept or reject this proposal.",
        type: "Milestone proposal",
    },
    {
        id: 3,
        pairId: "alice-noah",
        pair: "Alice × Noah",
        title: "Mutual check-in",
        description: "Noah has already accepted.",
        type: "Waiting for you",
    },
]

export default function StudDashboardPage() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">
            {/* HEADER */}
            <header className="border-b border-[#3D3B3A]/10 px-6">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <nav className="hidden items-center gap-8 text-sm text-[#3D3B3A]/45 md:flex">
                        <span className="font-medium text-[#3D3B3A]">
                            Home
                        </span>

                        <button
                            onClick={() => router.push("/stud/discover")}
                            className="transition hover:text-[#3D3B3A]"
                        >
                            Discover
                        </button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 text-xs text-[#3D3B3A]/45 sm:flex">
                            <BadgeCheck className="h-4 w-4" />
                            Verified Stud
                        </div>

                        <div className="h-9 w-9 overflow-hidden rounded-full">
                            <img
                                src={currentStud.image}
                                alt={currentStud.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* =======================
            PROFILE HERO
        ======================== */}
                <section className="mb-14 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/35">
                            Your Stud
                        </p>

                        <div className="mb-5 flex items-center gap-3">
                            <h1 className="font-serif text-5xl md:text-6xl">
                                Hey, {currentStud.name}.
                            </h1>

                            <BadgeCheck className="h-5 w-5" />
                        </div>

                        <p className="max-w-xl text-base leading-relaxed text-[#3D3B3A]/50">
                            Discover verified people, manage your matches, and grow the
                            shared identities you&apos;ve created together.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/stud/discover")}
                        className="group flex items-center gap-5 rounded-full bg-[#3D3B3A] py-2 pl-6 pr-2 text-sm font-medium text-[#E2A9F1]"
                    >
                        Discover people

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
                            <Search className="h-4 w-4" />
                        </span>
                    </button>
                </section>

                {/* =======================
            PROFILE + METRICS
        ======================== */}
                <section className="mb-14 grid gap-5 lg:grid-cols-[1.2fr_2fr]">
                    <div className="flex items-center gap-5 rounded-[2rem] border border-[#3D3B3A]/10 p-6">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
                            <img
                                src={currentStud.image}
                                alt={currentStud.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-medium">
                                    {currentStud.name}, {currentStud.age}
                                </p>

                                <BadgeCheck className="h-4 w-4" />
                            </div>

                            <p className="mt-1 text-sm text-[#3D3B3A]/45">
                                {currentStud.occupation} · {currentStud.location}
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-xs text-[#3D3B3A]/35">
                                <ShieldCheck className="h-4 w-4" />
                                World ID verified
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Metric
                            label="Verified Matches"
                            value={String(currentStud.verifiedMatches)}
                        />

                        <Metric
                            label="Active Pairs"
                            value={String(pairs.length)}
                        />

                        <Metric
                            label="Pending Actions"
                            value={String(pendingActions.length)}
                        />
                    </div>
                </section>

                {/* =======================
            PENDING ACTIONS
        ======================== */}
                <section className="mb-16">
                    <div className="mb-7 flex items-end justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                                Needs your attention
                            </p>

                            <h2 className="font-serif text-4xl">
                                Pending actions
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/35">
                            <Bell className="h-4 w-4" />
                            {pendingActions.length} pending
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendingActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: index * 0.05,
                                }}
                                onClick={() =>
                                    router.push(`/stud/pair/${action.pairId}`)
                                }
                                className="group flex w-full flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 p-5 text-left transition-all hover:bg-[#E2A9F1]/15 sm:flex-row sm:items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#E2A9F1]/40">
                                        <Sparkles className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <p className="font-medium">
                                                {action.title}
                                            </p>

                                            <span className="rounded-full bg-[#3D3B3A]/5 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-[#3D3B3A]/40">
                                                {action.type}
                                            </span>
                                        </div>

                                        <p className="text-sm text-[#3D3B3A]/40">
                                            {action.pair} · {action.description}
                                        </p>
                                    </div>
                                </div>

                                <ArrowUpRight className="h-4 w-4 text-[#3D3B3A]/30 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#3D3B3A]" />
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* =======================
            MY PAIRS
        ======================== */}
                <section className="mb-16">
                    <div className="mb-7 flex items-end justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                                Shared identities
                            </p>

                            <h2 className="font-serif text-4xl">
                                My Pairs
                            </h2>
                        </div>

                        <p className="text-xs text-[#3D3B3A]/35">
                            {pairs.length} active
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {pairs.map((pair, index) => (
                            <PairCard
                                key={pair.id}
                                pair={pair}
                                index={index}
                                onClick={() =>
                                    router.push(`/stud/pair/${pair.id}`)
                                }
                            />
                        ))}
                    </div>
                </section>

                {/* =======================
            MATCHES
        ======================== */}
                <section className="pb-20">
                    <div className="mb-7 flex items-end justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                                Connections
                            </p>

                            <h2 className="font-serif text-4xl">
                                Your matches
                            </h2>
                        </div>

                        <button
                            onClick={() => router.push("/stud/discover")}
                            className="flex items-center gap-2 text-sm text-[#3D3B3A]/45 hover:text-[#3D3B3A]"
                        >
                            Discover more
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {matches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                            />
                        ))}
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
        <div className="rounded-[2rem] border border-[#3D3B3A]/10 p-5">
            <p className="text-3xl font-light">
                {value}
            </p>

            <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/35">
                {label}
            </p>
        </div>
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
            onClick={onClick}
            className="group rounded-[2rem] border border-[#3D3B3A]/10 p-6 text-left transition-all hover:-translate-y-1 hover:bg-[#E2A9F1]/10 hover:shadow-lg"
        >
            <div className="mb-8 flex items-start justify-between">
                {/* Avatars */}
                <div className="flex items-center">
                    <div className="relative z-10 h-14 w-14 overflow-hidden rounded-full border-2 border-background">
                        <img
                            src={currentStud.image}
                            alt={currentStud.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="-ml-4 h-14 w-14 overflow-hidden rounded-full border-2 border-background">
                        <img
                            src={pair.otherImage}
                            alt={pair.otherName}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#E2A9F1]">
                        <HeartHandshake className="h-4 w-4" />
                    </div>
                </div>

                {pair.pendingActions > 0 && (
                    <div className="rounded-full bg-[#E2A9F1]/35 px-3 py-1.5 text-[10px]">
                        {pair.pendingActions} pending
                    </div>
                )}
            </div>

            <div className="mb-7">
                <h3 className="text-2xl font-medium">
                    {pair.names}
                </h3>

                <p className="mt-1 text-sm text-[#3D3B3A]/40">
                    {pair.token}
                </p>
            </div>

            <div className="mb-6">
                <div className="mb-3 flex justify-between text-xs">
                    <span className="text-[#3D3B3A]/40">
                        Reputation
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

            <div className="grid grid-cols-2 gap-3 border-t border-[#3D3B3A]/10 pt-5">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.13em] text-[#3D3B3A]/30">
                        Stage
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {pair.stage}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.13em] text-[#3D3B3A]/30">
                        Capacity
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {pair.capacity}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
                <span>
                    Open Pair
                </span>

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
        </motion.button>
    )
}

function MatchCard({
    match,
}: {
    match: (typeof matches)[number]
}) {
    return (
        <div className="overflow-hidden rounded-[2rem] border border-[#3D3B3A]/10">
            <div className="relative h-[230px]">
                <img
                    src={match.image}
                    alt={match.name}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-1.5">
                        <p className="font-medium">
                            {match.name}, {match.age}
                        </p>

                        <BadgeCheck className="h-4 w-4" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    {match.status === "New match" ? (
                        <Heart className="h-4 w-4" />
                    ) : (
                        <HeartHandshake className="h-4 w-4" />
                    )}

                    <span className="text-xs text-[#3D3B3A]/45">
                        {match.status}
                    </span>
                </div>

                <BadgeCheck className="h-3.5 w-3.5 text-[#3D3B3A]/30" />
            </div>
        </div>
    )
}