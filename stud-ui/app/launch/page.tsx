"use client"

import { motion } from "framer-motion"
import {
    ArrowUpRight,
    HeartHandshake,
    TrendingUp,
    UserRound,
    BadgeCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LaunchPage() {
    const router = useRouter()

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 py-12">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-stud-bg/35 blur-[140px]" />
            </div>

            {/* Top bar */}
            <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
                <button
                    onClick={() => router.push("/")}
                    className="text-xl font-semibold tracking-[-0.04em] text-stud-ink"
                >
                    STUD
                </button>

                <div className="flex items-center gap-2 text-xs text-stud-ink/45">
                    <BadgeCheck className="h-4 w-4" />
                    Powered by World ID
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mb-14 text-center"
                >
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-stud-ink/45">
                        Enter Stud
                    </p>

                    <h1 className="mb-6 font-serif text-5xl font-normal tracking-tight text-stud-ink md:text-6xl lg:text-7xl">
                        How do you want
                        <br />
                        to participate?
                    </h1>

                    <p className="mx-auto max-w-xl text-base leading-relaxed text-stud-ink/55 md:text-lg">
                        Meet verified people and build a Pair, or discover opportunities
                        across Stud&apos;s social markets.
                    </p>
                </motion.div>

                {/* Cards */}


                <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
                    {/* STUD */}
                    <motion.button
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        whileHover={{ y: -5 }}
                        onClick={() => router.push("/stud/onboarding")}
                        className="group relative overflow-hidden rounded-[2rem] border border-stud-ink/10 bg-stud-light/45 p-8 text-left transition-all duration-300 hover:bg-stud-light hover:shadow-xl md:p-10"
                    >
                        <Link href="/stud/onboarding">
                            <div className="mb-14 flex items-start justify-between">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stud-ink text-stud-bg">
                                    <HeartHandshake
                                        className="h-6 w-6"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stud-ink/10 transition-all duration-300 group-hover:bg-stud-ink">
                                    <ArrowUpRight className="h-4 w-4 text-stud-ink transition-colors group-hover:text-stud-bg" />
                                </div>
                            </div>

                            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stud-ink/40">
                                Social side
                            </p>

                            <h2 className="mb-4 font-serif text-4xl text-stud-ink">
                                Join as a Stud
                            </h2>

                            <p className="mb-8 max-w-sm leading-relaxed text-stud-ink/55">
                                Verify as a unique human, discover other verified people, swipe,
                                match, and create a shared Pair identity.
                            </p>

                            <div className="space-y-3 border-t border-stud-ink/10 pt-6">
                                <Feature text="World ID verified profile" />
                                <Feature text="Swipe verified people" />
                                <Feature text="Mutual match creates a Pair" />
                            </div>

                        </Link>
                    </motion.button>

                    {/* INVESTOR */}
                    <motion.button
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        whileHover={{ y: -5 }}
                        onClick={() => router.push("/investor")}
                        className="group relative overflow-hidden rounded-[2rem] bg-stud-ink p-8 text-left text-stud-bg transition-all duration-300 hover:shadow-xl md:p-10"
                    >
                        <Link href="/investor">
                            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-stud-bg/10 blur-3xl" />

                            <div className="relative z-10">
                                <div className="mb-14 flex items-start justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stud-bg text-stud-ink">
                                        <TrendingUp
                                            className="h-6 w-6"
                                            strokeWidth={1.5}
                                        />
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stud-bg/20 transition-all duration-300 group-hover:bg-stud-bg">
                                        <ArrowUpRight className="h-4 w-4 transition-colors group-hover:text-stud-ink" />
                                    </div>
                                </div>

                                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-stud-bg/40">
                                    Market side
                                </p>

                                <h2 className="mb-4 font-serif text-4xl">
                                    Join as an Investor
                                </h2>

                                <p className="mb-8 max-w-sm leading-relaxed text-stud-bg/60">
                                    Discover verified Studs and Pairs, follow reputation, and take
                                    positions on objective social outcomes.
                                </p>

                                <div className="space-y-3 border-t border-stud-bg/15 pt-6">
                                    <InvestorFeature text="Browse verified Studs" />
                                    <InvestorFeature text="Trade objective outcome markets" />
                                    <InvestorFeature text="Discover evolving Pair Tokens" />
                                </div>
                            </div>
                        </Link>
                    </motion.button>
                </div>

                <p className="mt-8 text-center text-xs text-stud-ink/35">
                    You can switch between social and market experiences later.
                </p>
            </div>
        </main>
    )
}

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-stud-ink/60">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stud-ink/8">
                <UserRound className="h-3.5 w-3.5" />
            </div>

            {text}
        </div>
    )
}

function InvestorFeature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-stud-bg/60">
            <div className="h-1.5 w-1.5 rounded-full bg-stud-bg/60" />
            {text}
        </div>
    )
}