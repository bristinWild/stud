"use client"

import {
    useEffect,
    useMemo,
    useState,
} from "react"

import {
    useRouter,
} from "next/navigation"

import {
    motion,
} from "framer-motion"

import {
    ArrowUpRight,
    BadgeCheck,
    BarChart3,
    HeartHandshake,
    Search,
    TrendingUp,
    Users,
} from "lucide-react"

import {
    formatUnits,
} from "viem"

import {
    WalletButton,
} from "@/components/wallet-button"


type Tab =
    | "studs"
    | "pairs"


type StudMeta = {
    id: string
    onchainStudId: number

    name: string
    age: number
    location: string
    occupation: string
    image: string
}


type StudExplorerData =
    StudMeta & {
        activeMarkets: number
        volume: number

        topMarket: string | null

        yes: number | null
        no: number | null
    }


type PairMeta = {
    id: string
    onchainPairId: number

    names: string
    token: string
}


type PairExplorerData =
    PairMeta & {
        reputation: number
        stage: string

        capacity: number
        price: number
        reserve: number

        active: boolean
        marketActive: boolean
    }


type PredictionMarketResponse = {
    markets: Array<{
        address: string
        question: string

        closesAt: string

        pools: {
            yes: string
            no: string
            total: string
        }

        probabilities: {
            yesPercent: number
            noPercent: number
        }

        outcome: {
            label:
            | "unresolved"
            | "yes"
            | "no"
        }
    }>
}


type OnchainPair = {
    id: string

    memberA: string
    memberB: string

    reputation: string
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
    } | null
}


const studMetadata:
    StudMeta[] = [
        {
            id: "alan",
            onchainStudId: 1,

            name: "Alan",
            age: 27,
            location: "Onchain",
            occupation: "Verified Stud",

            image:
                "/images/alice-profile.jpg",
        },

        {
            id: "leo",
            onchainStudId: 2,

            name: "Leo",
            age: 27,
            location: "Mumbai",
            occupation: "Founder",

            image:
                "/images/profiles/leo.jpg",
        },

        {
            id: "noah",
            onchainStudId: 3,

            name: "Noah",
            age: 25,
            location: "Bengaluru",
            occupation:
                "Product Designer",

            image:
                "/images/profiles/noah.jpg",
        },

        {
            id: "theo",
            onchainStudId: 5,

            name: "Theo",
            age: 26,
            location: "Onchain",
            occupation: "Verified Stud",

            image:
                "/images/profiles/theo.jpg",
        },
    ]


const pairMetadata:
    PairMeta[] = [
        {
            id: "alice-leo",
            onchainPairId: 1,

            names:
                "Alice × Leo",

            token:
                "$ALICELEO",
        },

        {
            id: "alan-theo",
            onchainPairId: 3,

            names:
                "Alan × Theo",

            token:
                "$ALANTHEO",
        },

        {
            id: "alice-noah",
            onchainPairId: 2,

            names:
                "Alice × Noah",

            token:
                "$ALICENOAH",
        },
    ]


export default function InvestorPage() {
    const router =
        useRouter()

    const backendUrl =
        process.env
            .BACKEND_URL ??
        "http://localhost:3001"


    const [
        tab,
        setTab,
    ] =
        useState<Tab>(
            "studs"
        )

    const [
        search,
        setSearch,
    ] =
        useState("")


    const [
        studs,
        setStuds,
    ] =
        useState<
            StudExplorerData[]
        >([])

    const [
        pairs,
        setPairs,
    ] =
        useState<
            PairExplorerData[]
        >([])

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState("")


    /*
     * ==========================
     * LOAD REAL EXPLORER DATA
     * ==========================
     */

    useEffect(
        () => {
            async function load() {
                try {
                    setLoading(
                        true
                    )

                    setError(
                        ""
                    )


                    /*
                     * --------------------------
                     * STUD PREDICTION MARKETS
                     * --------------------------
                     */

                    const loadedStuds =
                        await Promise.all(
                            studMetadata.map(
                                async (
                                    stud
                                ) => {
                                    try {
                                        const response =
                                            await fetch(
                                                `${backendUrl}/onchain/stud/${stud.onchainStudId}/prediction-markets`,
                                                {
                                                    cache:
                                                        "no-store",
                                                }
                                            )

                                        if (
                                            !response.ok
                                        ) {
                                            throw new Error(
                                                `Could not load ${stud.name}'s markets.`
                                            )
                                        }

                                        const data:
                                            PredictionMarketResponse =
                                            await response.json()


                                        const markets =
                                            data.markets ??
                                            []


                                        const activeMarkets =
                                            markets.filter(
                                                (
                                                    market
                                                ) => {
                                                    const unresolved =
                                                        market
                                                            .outcome
                                                            .label ===
                                                        "unresolved"

                                                    return unresolved
                                                }
                                            )


                                        const volume =
                                            markets.reduce(
                                                (
                                                    total,
                                                    market
                                                ) =>
                                                    total +
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
                                                0
                                            )


                                        const topMarket =
                                            activeMarkets[0] ??
                                            markets[0] ??
                                            null


                                        return {
                                            ...stud,

                                            activeMarkets:
                                                activeMarkets.length,

                                            volume,

                                            topMarket:
                                                topMarket
                                                    ?.question ??
                                                null,

                                            yes:
                                                topMarket
                                                    ? topMarket
                                                        .probabilities
                                                        .yesPercent /
                                                    100
                                                    : null,

                                            no:
                                                topMarket
                                                    ? topMarket
                                                        .probabilities
                                                        .noPercent /
                                                    100
                                                    : null,
                                        }
                                    } catch (
                                    error
                                    ) {
                                        console.error(
                                            error
                                        )

                                        return {
                                            ...stud,

                                            activeMarkets:
                                                0,

                                            volume:
                                                0,

                                            topMarket:
                                                null,

                                            yes:
                                                null,

                                            no:
                                                null,
                                        }
                                    }
                                }
                            )
                        )


                    /*
                     * --------------------------
                     * PAIR MARKETS
                     * --------------------------
                     */

                    const loadedPairs =
                        await Promise.all(
                            pairMetadata.map(
                                async (
                                    pair
                                ) => {
                                    const response =
                                        await fetch(
                                            `${backendUrl}/onchain/pair/${pair.onchainPairId}`,
                                            {
                                                cache:
                                                    "no-store",
                                            }
                                        )

                                    if (
                                        !response.ok
                                    ) {
                                        throw new Error(
                                            `Could not load Pair #${pair.onchainPairId}.`
                                        )
                                    }

                                    const data:
                                        OnchainPair =
                                        await response.json()


                                    const reputation =
                                        Number(
                                            data.reputation
                                        )


                                    const stage =
                                        reputation <
                                            20
                                            ? "New"
                                            : reputation <
                                                50
                                                ? "Growing"
                                                : reputation <
                                                    70
                                                    ? "Established"
                                                    : "Graduation"


                                    const price =
                                        data.market
                                            ? Number(
                                                formatUnits(
                                                    BigInt(
                                                        data
                                                            .market
                                                            .currentPrice
                                                    ),
                                                    6
                                                )
                                            )
                                            : 0


                                    const reserve =
                                        data.market
                                            ? Number(
                                                formatUnits(
                                                    BigInt(
                                                        data
                                                            .market
                                                            .reserve
                                                    ),
                                                    6
                                                )
                                            )
                                            : 0


                                    const capacity =
                                        data.market
                                            ? Number(
                                                formatUnits(
                                                    BigInt(
                                                        data
                                                            .market
                                                            .marketCapacity
                                                    ),
                                                    6
                                                )
                                            )
                                            : 0


                                    return {
                                        ...pair,

                                        reputation,
                                        stage,

                                        price,
                                        reserve,
                                        capacity,

                                        active:
                                            data.active,

                                        marketActive:
                                            Boolean(
                                                data.market
                                            ),
                                    }
                                }
                            )
                        )


                    setStuds(
                        loadedStuds
                    )

                    setPairs(
                        loadedPairs
                    )
                } catch (
                error
                ) {
                    console.error(
                        error
                    )

                    setError(
                        error instanceof Error
                            ? error.message
                            : "Could not load investor explorer."
                    )
                } finally {
                    setLoading(
                        false
                    )
                }
            }


            void load()
        },
        [
            backendUrl,
        ]
    )


    /*
     * ==========================
     * FILTERING
     * ==========================
     */

    const filteredStuds =
        useMemo(
            () =>
                studs.filter(
                    (
                        stud
                    ) =>
                        stud.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                ),
            [
                studs,
                search,
            ]
        )


    const filteredPairs =
        useMemo(
            () =>
                pairs.filter(
                    (
                        pair
                    ) =>
                        pair.names
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        pair.token
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                ),
            [
                pairs,
                search,
            ]
        )


    /*
     * ==========================
     * LIVE METRICS
     * ==========================
     */

    const totalActiveMarkets =
        studs.reduce(
            (
                total,
                stud
            ) =>
                total +
                stud.activeMarkets,
            0
        )


    const totalVolume =
        studs.reduce(
            (
                total,
                stud
            ) =>
                total +
                stud.volume,
            0
        )


    const activePairs =
        pairs.filter(
            (
                pair
            ) =>
                pair.active
        ).length


    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">

            {/* ======================
                HEADER
            ====================== */}

            <header className="border-b border-[#3D3B3A]/10 px-6">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">

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


                    <div className="hidden items-center gap-2 rounded-full border border-[#3D3B3A]/10 px-4 py-2 text-xs text-[#3D3B3A]/50 sm:flex">

                        <TrendingUp className="h-4 w-4" />

                        Investor Explorer

                    </div>


                    <div className="flex items-center gap-4">

                        <button
                            onClick={() =>
                                router.push(
                                    "/launch"
                                )
                            }
                            className="hidden text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A] sm:block"
                        >
                            Switch mode
                        </button>

                        <WalletButton />

                    </div>

                </div>

            </header>


            <div className="mx-auto max-w-7xl px-6 py-12">

                {/* ======================
                    INTRO
                ====================== */}

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
                        Explore verified Studs,
                        trade objective social outcomes,
                        and back Pair Tokens as verified
                        reputation unlocks larger markets.
                    </p>

                </div>


                {/* ======================
                    STATUS
                ====================== */}

                <div className="mb-8 rounded-2xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/20 px-5 py-3 text-xs text-[#3D3B3A]/50">

                    {loading
                        ? "Loading local onchain markets..."
                        : "Local demo network · Market values below are read from deployed contracts."
                    }

                </div>


                {error && (

                    <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-600">

                        {error}

                    </div>

                )}


                {/* ======================
                    LIVE OVERVIEW
                ====================== */}

                <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <Metric
                        icon={
                            Users
                        }
                        label="Verified Studs"
                        value={
                            String(
                                studs.length
                            )
                        }
                        detail="Onchain humans"
                    />

                    <Metric
                        icon={
                            BarChart3
                        }
                        label="Active Markets"
                        value={
                            String(
                                totalActiveMarkets
                            )
                        }
                        detail="Prediction markets"
                    />

                    <Metric
                        icon={
                            HeartHandshake
                        }
                        label="Active Pairs"
                        value={
                            String(
                                activePairs
                            )
                        }
                        detail="Shared identities"
                    />

                    <Metric
                        icon={
                            TrendingUp
                        }
                        label="Prediction Volume"
                        value={
                            `$${totalVolume.toLocaleString(
                                undefined,
                                {
                                    maximumFractionDigits:
                                        2,
                                }
                            )}`
                        }
                        detail="Onchain USDC"
                    />

                </div>


                {/* ======================
                    CONTROLS
                ====================== */}

                <div className="mb-8 flex flex-col gap-4 border-b border-[#3D3B3A]/10 pb-6 md:flex-row md:items-center md:justify-between">

                    <div className="flex gap-2 rounded-full bg-[#3D3B3A]/5 p-1">

                        <TabButton
                            active={
                                tab ===
                                "studs"
                            }
                            onClick={() =>
                                setTab(
                                    "studs"
                                )
                            }
                        >
                            Studs
                        </TabButton>

                        <TabButton
                            active={
                                tab ===
                                "pairs"
                            }
                            onClick={() =>
                                setTab(
                                    "pairs"
                                )
                            }
                        >
                            Pairs
                        </TabButton>

                    </div>


                    <div className="flex min-w-[280px] items-center gap-3 rounded-full border border-[#3D3B3A]/10 px-4 py-3">

                        <Search className="h-4 w-4 text-[#3D3B3A]/35" />

                        <input
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder={
                                tab ===
                                    "studs"
                                    ? "Search verified Studs"
                                    : "Search Pairs or tokens"
                            }
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#3D3B3A]/30"
                        />

                    </div>

                </div>


                {/* ======================
                    STUDS
                ====================== */}

                {tab ===
                    "studs" && (
                        <>

                            <div className="mb-6 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-medium">
                                        Verified Studs
                                    </h2>

                                    <p className="mt-1 text-sm text-[#3D3B3A]/45">
                                        Prediction markets backed by
                                        objective protocol outcomes.
                                    </p>

                                </div>


                                <p className="text-xs text-[#3D3B3A]/35">
                                    {
                                        filteredStuds.length
                                    }{" "}
                                    profiles
                                </p>

                            </div>


                            {loading ? (

                                <LoadingPanel />

                            ) : (

                                <div className="grid gap-5 md:grid-cols-2">

                                    {filteredStuds.map(
                                        (
                                            stud,
                                            index
                                        ) => (

                                            <StudMarketCard
                                                key={
                                                    stud.id
                                                }
                                                stud={
                                                    stud
                                                }
                                                index={
                                                    index
                                                }
                                                onClick={() =>
                                                    router.push(
                                                        `/investor/stud/${stud.id}`
                                                    )
                                                }
                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </>
                    )}


                {/* ======================
                    PAIRS
                ====================== */}

                {tab ===
                    "pairs" && (
                        <>

                            <div className="mb-6 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-medium">
                                        Pair Markets
                                    </h2>

                                    <p className="mt-1 text-sm text-[#3D3B3A]/45">
                                        Live bonding-curve markets
                                        around verified shared identities.
                                    </p>

                                </div>


                                <p className="text-xs text-[#3D3B3A]/35">
                                    {
                                        filteredPairs.length
                                    }{" "}
                                    pairs
                                </p>

                            </div>


                            {loading ? (

                                <LoadingPanel />

                            ) : (

                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                                    {filteredPairs.map(
                                        (
                                            pair,
                                            index
                                        ) => (

                                            <PairCard
                                                key={
                                                    pair.onchainPairId
                                                }
                                                pair={
                                                    pair
                                                }
                                                index={
                                                    index
                                                }
                                                onClick={() =>
                                                    router.push(
                                                        `/investor/pair/${pair.onchainPairId}`
                                                    )
                                                }
                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </>
                    )}

            </div>

        </main>
    )
}


/*
 * ==================================
 * METRIC
 * ==================================
 */

function Metric({
    icon:
    Icon,
    label,
    value,
    detail,
}: {
    icon:
    typeof Users

    label:
    string

    value:
    string

    detail:
    string
}) {
    return (
        <div className="rounded-3xl border border-[#3D3B3A]/10 p-5">

            <div className="mb-8 flex items-center justify-between">

                <Icon
                    className="h-5 w-5 text-[#3D3B3A]/50"
                    strokeWidth={
                        1.5
                    }
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


/*
 * ==================================
 * TABS
 * ==================================
 */

function TabButton({
    children,
    active,
    onClick,
}: {
    children:
    React.ReactNode

    active:
    boolean

    onClick:
    () => void
}) {
    return (
        <button
            onClick={
                onClick
            }
            className={`rounded-full px-5 py-2 text-sm transition ${active
                ? "bg-[#3D3B3A] text-[#F2D8F8]"
                : "text-[#3D3B3A]/50 hover:text-[#3D3B3A]"
                }`}
        >
            {children}
        </button>
    )
}


/*
 * ==================================
 * STUD CARD
 * ==================================
 */

function StudMarketCard({
    stud,
    index,
    onClick,
}: {
    stud:
    StudExplorerData

    index:
    number

    onClick:
    () => void
}) {
    return (
        <motion.button
            initial={{
                opacity:
                    0,

                y:
                    15,
            }}
            animate={{
                opacity:
                    1,

                y:
                    0,
            }}
            transition={{
                delay:
                    index *
                    0.05,
            }}
            onClick={
                onClick
            }
            className="group overflow-hidden rounded-[2rem] border border-[#3D3B3A]/10 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
        >

            <div className="grid sm:grid-cols-[180px_1fr]">

                <div className="relative min-h-[230px] overflow-hidden bg-[#E2A9F1]">

                    <img
                        src={
                            stud.image
                        }
                        alt={
                            stud.name
                        }
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />


                    <div className="absolute bottom-4 left-4 text-white">

                        <div className="flex items-center gap-1.5">

                            <p className="text-lg font-medium">
                                {
                                    stud.name
                                }
                                ,{" "}
                                {
                                    stud.age
                                }
                            </p>

                            <BadgeCheck className="h-4 w-4" />

                        </div>


                        <p className="mt-1 text-xs text-white/65">
                            {
                                stud.location
                            }
                        </p>

                    </div>

                </div>


                <div className="p-6">

                    <div className="mb-6 flex items-start justify-between">

                        <div>

                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                                Top market
                            </p>


                            <p className="mt-2 max-w-sm text-base font-medium leading-snug">

                                {
                                    stud.topMarket ??
                                    "No prediction market yet."
                                }

                            </p>

                        </div>


                        <ArrowUpRight className="h-4 w-4 text-[#3D3B3A]/30 transition group-hover:text-[#3D3B3A]" />

                    </div>


                    {stud.topMarket &&
                        stud.yes !==
                        null &&
                        stud.no !==
                        null ? (

                        <div className="mb-6 grid grid-cols-2 gap-3">

                            <div className="rounded-2xl bg-[#E2A9F1]/35 p-4">

                                <p className="text-xs text-[#3D3B3A]/40">
                                    YES
                                </p>

                                <p className="mt-1 text-2xl font-medium">
                                    {
                                        (
                                            stud.yes *
                                            100
                                        ).toFixed(
                                            0
                                        )
                                    }
                                    %
                                </p>

                            </div>


                            <div className="rounded-2xl bg-[#3D3B3A]/5 p-4">

                                <p className="text-xs text-[#3D3B3A]/40">
                                    NO
                                </p>

                                <p className="mt-1 text-2xl font-medium">
                                    {
                                        (
                                            stud.no *
                                            100
                                        ).toFixed(
                                            0
                                        )
                                    }
                                    %
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="mb-6 rounded-2xl bg-[#3D3B3A]/5 p-4 text-sm text-[#3D3B3A]/40">
                            Waiting for an objective market.
                        </div>

                    )}


                    <div className="flex items-center justify-between border-t border-[#3D3B3A]/10 pt-4 text-xs text-[#3D3B3A]/40">

                        <span>
                            {
                                stud.activeMarkets
                            }{" "}
                            active{" "}
                            {
                                stud.activeMarkets ===
                                    1
                                    ? "market"
                                    : "markets"
                            }
                        </span>


                        <span>
                            $
                            {
                                stud.volume.toLocaleString(
                                    undefined,
                                    {
                                        maximumFractionDigits:
                                            2,
                                    }
                                )
                            }{" "}
                            volume
                        </span>

                    </div>

                </div>

            </div>

        </motion.button>
    )
}


/*
 * ==================================
 * PAIR CARD
 * ==================================
 */

function PairCard({
    pair,
    index,
    onClick,
}: {
    pair:
    PairExplorerData

    index:
    number

    onClick:
    () => void
}) {
    return (
        <motion.button
            initial={{
                opacity:
                    0,

                y:
                    15,
            }}
            animate={{
                opacity:
                    1,

                y:
                    0,
            }}
            transition={{
                delay:
                    index *
                    0.05,
            }}
            onClick={
                onClick
            }
            className="group rounded-[2rem] border border-[#3D3B3A]/10 p-6 text-left transition-all hover:-translate-y-1 hover:bg-[#E2A9F1]/15 hover:shadow-lg"
        >

            <div className="mb-8 flex items-start justify-between">

                <div>

                    <p className="text-xs uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                        Pair Token
                    </p>

                    <h3 className="mt-2 text-xl font-medium">
                        {
                            pair.names
                        }
                    </h3>

                    <p className="mt-1 text-sm text-[#3D3B3A]/40">
                        {
                            pair.token
                        }
                    </p>

                </div>


                <span className="rounded-full border border-[#3D3B3A]/10 px-3 py-1.5 text-[10px] text-[#3D3B3A]/45">
                    {
                        pair.stage
                    }
                </span>

            </div>


            <div className="mb-6 flex items-end justify-between">

                <div>

                    <p className="text-xs text-[#3D3B3A]/35">
                        Price
                    </p>

                    <p className="mt-1 text-3xl font-light">

                        {
                            pair.marketActive
                                ? `$${pair.price.toFixed(
                                    2
                                )}`
                                : "—"
                        }

                    </p>

                </div>


                <p className="text-xs text-[#3D3B3A]/40">

                    {
                        pair.marketActive
                            ? "Live onchain"
                            : "Market inactive"
                    }

                </p>

            </div>


            <div className="mb-6">

                <div className="mb-2 flex justify-between text-xs">

                    <span className="text-[#3D3B3A]/40">
                        Reputation
                    </span>

                    <span>
                        {
                            pair.reputation
                        }
                        /100
                    </span>

                </div>


                <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">

                    <div
                        className="h-full rounded-full bg-[#3D3B3A]"
                        style={{
                            width:
                                `${Math.min(
                                    pair.reputation,
                                    100
                                )}%`,
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

                        {
                            pair.marketActive
                                ? `$${pair.reserve.toLocaleString()}`
                                : "—"
                        }

                    </p>

                </div>


                <div>

                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                        Capacity
                    </p>

                    <p className="mt-1 text-sm font-medium">

                        {
                            pair.marketActive
                                ? `$${pair.capacity.toLocaleString()}`
                                : "—"
                        }

                    </p>

                </div>

            </div>


            <div className="mt-6 flex items-center justify-between text-sm">

                <span>
                    {
                        pair.marketActive
                            ? "Open market"
                            : "View Pair"
                    }
                </span>

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />

            </div>

        </motion.button>
    )
}


/*
 * ==================================
 * LOADING
 * ==================================
 */

function LoadingPanel() {
    return (
        <div className="rounded-[2rem] border border-[#3D3B3A]/10 py-16 text-center">

            <p className="text-sm text-[#3D3B3A]/40">
                Reading local onchain state...
            </p>

        </div>
    )
}