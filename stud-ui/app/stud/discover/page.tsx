"use client"

import {
    useEffect,
    useMemo,
    useState,
} from "react"
import { useRouter } from "next/navigation"
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useTransform,
} from "framer-motion"
import {
    ArrowLeft,
    BadgeCheck,
    Heart,
    RotateCcw,
    ShieldCheck,
    X,
} from "lucide-react"

import {
    WalletButton,
} from "@/components/wallet-button"

import {
    useWallet,
} from "@/components/wallet-provider"

import {
    type Address,
} from "viem"

import {
    createPairFromMatch,
} from "@/lib/pair"

import Link from "next/link"

type Profile = {
    id: number | string
    name: string
    age: number
    occupation: string
    location: string
    bio: string
    interests: string[]
    image: string
    wallet?: Address
    likedYou?: boolean
    live?: boolean
}

const demoProfiles: Profile[] = [
    {
        id: 1,
        name: "Noah",
        age: 25,
        occupation: "Product Designer",
        location: "Bengaluru",
        bio: "Coffee, live music, spontaneous weekend plans.",
        interests: ["Coffee", "Design", "Music"],
        image: "/images/profiles/noah.jpg",

        wallet:
            "0x90F79bf6EB2c4f870365E785982E1f101E93b906",

        likedYou: true,
    },
    {
        id: 2,
        name: "Leo",
        age: 27,
        occupation: "Founder",
        location: "Mumbai",
        bio: "Building things, finding good food, and never skipping sunset.",
        interests: ["Startups", "Food", "Travel"],
        image: "/images/profiles/leo.jpg",

        wallet:
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",

        likedYou: true,
    },
    {
        id: 3,
        name: "Kai",
        age: 24,
        occupation: "Photographer",
        location: "Delhi",
        bio: "Usually carrying a camera. Always looking for somewhere new.",
        interests: ["Photography", "Travel", "Art"],
        image: "/images/profiles/kai.jpg",
    },
    {
        id: 4,
        name: "Theo",
        age: 26,
        occupation: "Software Engineer",
        location: "Hyderabad",
        bio: "Code during the week. Mountains whenever possible.",
        interests: ["Tech", "Hiking", "Cinema"],
        image: "/images/profiles/theo.jpg",
    },
]

const BACKEND =
    process.env
        .NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:3001"

type BackendProfile = {
    id: string
    studId: number
    wallet: string
    name: string
    age: number
    gender: string
    preference: string
    bio: string
    interests: string[]
    profileImage: string
}

export default function DiscoverPage() {
    const router = useRouter()

    const {
        address: walletAddress,
    } = useWallet()

    const [
        liveProfiles,
        setLiveProfiles,
    ] =
        useState<Profile[]>([])

    const [
        loadingProfiles,
        setLoadingProfiles,
    ] =
        useState(false)

    useEffect(() => {
        if (!walletAddress) {
            setLiveProfiles([])
            return
        }

        const controller =
            new AbortController()

        async function loadProfiles() {
            try {
                setLoadingProfiles(
                    true
                )

                const response =
                    await fetch(
                        `${BACKEND}/profiles/discover?wallet=${walletAddress}`,
                        {
                            cache:
                                "no-store",

                            signal:
                                controller.signal,
                        }
                    )

                const data =
                    await response.json()

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ??
                        "Could not load profiles."
                    )
                }

                const mappedProfiles:
                    Profile[] =
                    (
                        data as BackendProfile[]
                    ).map(
                        (item) => ({
                            id:
                                `live-${item.studId}`,

                            name:
                                item.name,

                            age:
                                item.age,

                            occupation:
                                "Verified Stud",

                            location:
                                "Onchain",

                            bio:
                                item.bio,

                            interests:
                                item.interests,

                            image:
                                item.profileImage,

                            wallet:
                                item.wallet as Address,

                            /*
                             * Real users have not
                             * automatically liked you.
                             */
                            likedYou:
                                false,

                            live:
                                true,
                        })
                    )

                setLiveProfiles(
                    mappedProfiles
                )
            } catch (
            error
            ) {
                if (
                    error instanceof DOMException &&
                    error.name ===
                    "AbortError"
                ) {
                    return
                }

                console.error(
                    "Could not load live profiles:",
                    error
                )
            } finally {
                setLoadingProfiles(
                    false
                )
            }
        }

        void loadProfiles()

        return () => {
            controller.abort()
        }
    }, [
        walletAddress,
    ])

    const profiles =
        useMemo(
            () => {
                const demoWallets =
                    new Set(
                        demoProfiles
                            .map(
                                (profile) =>
                                    profile.wallet
                                        ?.toLowerCase()
                            )
                            .filter(
                                (
                                    wallet
                                ):
                                    wallet is string =>
                                    Boolean(
                                        wallet
                                    )
                            )
                    )

                /*
                 * Keep demo cards,
                 * then append genuinely
                 * new database profiles.
                 *
                 * If Leo/Noah later also
                 * exist in Postgres, don't
                 * show them twice.
                 */
                const uniqueLive =
                    liveProfiles.filter(
                        (profile) =>
                            !profile.wallet ||
                            !demoWallets.has(
                                profile.wallet
                                    .toLowerCase()
                            )
                    )

                return [
                    ...demoProfiles,
                    ...uniqueLive,
                ]
            },
            [
                liveProfiles,
            ]
        )

    const [
        creatingPair,
        setCreatingPair,
    ] = useState(false)

    const [
        pairId,
        setPairId,
    ] = useState<bigint | null>(
        null
    )

    const [
        pairMessage,
        setPairMessage,
    ] = useState("")



    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<1 | -1>(1)
    const [match, setMatch] = useState<Profile | null>(null)


    useEffect(() => {
        setCurrentIndex(0)
        setMatch(null)
        setPairId(null)
        setPairMessage("")
    }, [walletAddress])


    const profile = profiles[currentIndex]

    const moveNext = async (
        swipeDirection: 1 | -1
    ) => {
        if (
            !profile ||
            creatingPair
        ) {
            return
        }

        setDirection(
            swipeDirection
        )

        // PASS
        if (
            swipeDirection === -1
        ) {
            setTimeout(() => {
                setCurrentIndex(
                    (prev) =>
                        prev + 1
                )
            }, 250)

            return
        }

        // LIKE, but not mutual
        if (
            !profile.likedYou
        ) {
            setTimeout(() => {
                setCurrentIndex(
                    (prev) =>
                        prev + 1
                )
            }, 250)

            return
        }

        // MUTUAL MATCH
        if (!walletAddress) {
            setPairMessage(
                "Connect your verified Stud wallet before matching."
            )

            return
        }

        if (!profile.wallet) {
            setPairMessage(
                "This profile is not connected to an onchain Stud yet."
            )

            return
        }

        try {
            setCreatingPair(
                true
            )

            setPairMessage(
                "Mutual match! Creating your Pair onchain..."
            )

            const result =
                await createPairFromMatch(
                    profile.wallet
                )

            setPairId(
                result.pairId
            )

            setPairMessage(
                result.alreadyExisted
                    ? `Pair #${result.pairId.toString()} already exists.`
                    : `Pair #${result.pairId.toString()} created onchain.`
            )

            setMatch(
                profile
            )

            setTimeout(() => {
                setCurrentIndex(
                    (prev) =>
                        prev + 1
                )
            }, 250)
        } catch (error) {
            console.error(
                error
            )

            setPairMessage(
                error instanceof Error
                    ? error.message
                    : "Could not create Pair."
            )
        } finally {
            setCreatingPair(
                false
            )
        }
    }

    const restart = () => {
        setCurrentIndex(0)
        setMatch(null)
        setPairId(null)
        setPairMessage("")
    }



    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 py-6">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E2A9F1]/20 blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between">
                <button
                    onClick={() => router.push("/stud/onboarding")}
                    className="flex items-center gap-2 text-sm text-[#3D3B3A]/55 transition hover:text-[#3D3B3A]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="text-xl font-semibold tracking-[-0.04em] text-[#3D3B3A]"
                >
                    STUD
                </button>

                <WalletButton />
            </header>

            {pairMessage && (
                <div className="relative z-30 mx-auto mt-5 max-w-xl rounded-2xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/30 px-5 py-4 text-center text-sm text-[#3D3B3A]">
                    {pairMessage}
                </div>
            )}

            {/* Main */}
            <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl items-center justify-center">
                <div className="grid w-full items-center gap-16 lg:grid-cols-[0.7fr_1fr_0.7fr]">

                    {/* LEFT */}
                    <div className="hidden lg:block">
                        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/40">
                            Discover
                        </p>

                        <h1 className="mb-6 font-serif text-5xl leading-[0.95] text-[#3D3B3A]">
                            Meet someone
                            <br />
                            worth matching.
                        </h1>

                        <p className="max-w-xs text-sm leading-relaxed text-[#3D3B3A]/50">
                            Every profile you see is backed by a verified unique human.
                        </p>

                        <div className="mt-8 flex items-center gap-2 text-xs text-[#3D3B3A]/40">
                            <ShieldCheck className="h-4 w-4" />
                            World ID verified profiles only
                        </div>
                    </div>

                    {/* CARD STACK */}
                    <div className="relative mx-auto h-[650px] w-full max-w-[430px]">

                        {/* Card behind */}
                        {profiles[currentIndex + 1] && (
                            <div className="absolute inset-0 translate-y-4 scale-[0.96] rounded-[2.5rem] bg-[#E2A9F1]/35" />
                        )}

                        <AnimatePresence mode="wait">
                            {profile ? (
                                <SwipeCard
                                    key={profile.id}
                                    profile={profile}
                                    direction={direction}
                                    onSwipe={moveNext}
                                />
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center rounded-[2.5rem] border border-[#3D3B3A]/10 text-center"
                                >
                                    <p className="mb-3 font-serif text-3xl text-[#3D3B3A]">
                                        That&apos;s everyone for now.
                                    </p>

                                    <p className="mb-8 text-sm text-[#3D3B3A]/45">
                                        More verified Studs will appear here.
                                    </p>

                                    <button
                                        onClick={restart}
                                        className="flex items-center gap-2 rounded-full bg-[#3D3B3A] px-5 py-3 text-sm text-[#F2D8F8]"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Start again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="hidden lg:flex lg:flex-col lg:items-center">
                        <p className="mb-6 text-xs uppercase tracking-[0.22em] text-[#3D3B3A]/35">
                            Your move
                        </p>

                        <div className="flex gap-4">
                            <button
                                disabled={
                                    !profile ||
                                    creatingPair
                                }
                                onClick={() => moveNext(-1)}
                                className="flex h-16 w-16 items-center justify-center rounded-full border border-[#3D3B3A]/10 bg-white transition-all hover:scale-105 hover:bg-[#3D3B3A] hover:text-white disabled:opacity-30"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <button
                                disabled={
                                    !profile ||
                                    creatingPair
                                }
                                onClick={() => moveNext(1)}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A] transition-all hover:scale-105 disabled:opacity-30"
                            >
                                <Heart className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-5 flex gap-10 text-[10px] uppercase tracking-[0.18em] text-[#3D3B3A]/35">
                            <span>Pass</span>
                            <span>Like</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE ACTIONS */}
            <div className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-5 lg:hidden">
                <button
                    disabled={
                        !profile ||
                        creatingPair
                    }
                    onClick={() => moveNext(-1)}

                    className="flex h-16 w-16 items-center justify-center rounded-full border border-[#3D3B3A]/10 bg-white shadow-lg disabled:opacity-30"
                >
                    <X className="h-6 w-6" />
                </button>

                <button
                    disabled={
                        !profile ||
                        creatingPair
                    }
                    onClick={() => moveNext(1)}

                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E2A9F1] shadow-lg disabled:opacity-30"
                >
                    <Heart className="h-6 w-6" />
                </button>
            </div>

            {/* MATCH MODAL */}
            <AnimatePresence>
                {match && (
                    <MatchModal
                        profile={match}
                        pairId={pairId}
                        onClose={() =>
                            setMatch(null)
                        }
                    />
                )}
            </AnimatePresence>
        </main>
    )
}

function SwipeCard({
    profile,
    onSwipe,
}: {
    profile: Profile
    direction: 1 | -1
    onSwipe: (direction: 1 | -1) => void
}) {
    const x = useMotionValue(0)

    const rotate = useTransform(x, [-250, 250], [-12, 12])

    const likeOpacity = useTransform(
        x,
        [20, 130],
        [0, 1]
    )

    const passOpacity = useTransform(
        x,
        [-130, -20],
        [1, 0]
    )

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            style={{ x, rotate }}
            onDragEnd={(_, info) => {
                if (info.offset.x > 120) {
                    onSwipe(1)
                } else if (info.offset.x < -120) {
                    onSwipe(-1)
                }
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
                opacity: 0,
                scale: 0.95,
            }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 cursor-grab overflow-hidden rounded-[2.5rem] bg-[#3D3B3A] shadow-[0_30px_80px_rgba(61,59,58,0.18)] active:cursor-grabbing"
        >
            {/* Image */}
            <img
                src={profile.image}
                alt={profile.name}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
            />

            {/* Dark fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/90" />

            {/* Swipe labels */}
            <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute left-6 top-10 rotate-[-10deg] rounded-xl border-2 border-white px-5 py-2 text-xl font-semibold uppercase tracking-widest text-white"
            >
                Like
            </motion.div>

            <motion.div
                style={{ opacity: passOpacity }}
                className="absolute right-6 top-10 rotate-[10deg] rounded-xl border-2 border-white px-5 py-2 text-xl font-semibold uppercase tracking-widest text-white"
            >
                Pass
            </motion.div>

            {/* Profile */}
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-3xl font-medium">
                        {profile.name}, {profile.age}
                    </h2>

                    <BadgeCheck className="h-5 w-5" />
                </div>

                {profile.live && (
                    <div className="mb-3">
                        <span className="rounded-full bg-[#E2A9F1] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#3D3B3A]">
                            Live profile
                        </span>
                    </div>
                )}

                <p className="mb-3 text-sm text-white/70">
                    {profile.occupation} · {profile.location}
                </p>

                <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/75">
                    {profile.bio}
                </p>

                <div className="mb-5 flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                        <span
                            key={interest}
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm"
                        >
                            {interest}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/55">
                    <ShieldCheck className="h-4 w-4" />
                    World ID verified
                </div>
            </div>
        </motion.div>
    )
}

function MatchModal({
    profile,
    pairId,
    onClose,
}: {
    profile: Profile
    pairId: bigint | null
    onClose: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm"
        >
            <motion.div
                initial={{
                    scale: 0.9,
                    y: 30,
                }}
                animate={{
                    scale: 1,
                    y: 0,
                }}
                exit={{
                    scale: 0.9,
                    opacity: 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 20,
                }}
                className="w-full max-w-md rounded-[2.5rem] bg-[#E2A9F1] p-8 text-center"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#3D3B3A] text-[#E2A9F1]">
                    <Heart className="h-7 w-7 fill-current" />
                </div>

                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#3D3B3A]/45">
                    Mutual Match
                </p>

                <h2 className="mb-3 font-serif text-5xl text-[#3D3B3A]">
                    It&apos;s a match.
                </h2>

                <p className="mx-auto mb-3 max-w-sm text-sm leading-relaxed text-[#3D3B3A]/60">
                    You and {profile.name} liked each other.
                    Your shared onchain identity is ready.
                </p>

                {pairId && (
                    <p className="mb-8 text-xs font-medium text-[#3D3B3A]/45">
                        Pair #{pairId.toString()}
                    </p>
                )}

                {pairId ? (
                    <Link
                        href={`/stud/pair/${pairId.toString()}`}
                        className="mb-3 block w-full rounded-full bg-[#3D3B3A] px-6 py-4 text-sm font-medium text-[#E2A9F1]"
                    >
                        View Pair
                    </Link>
                ) : (
                    <button
                        disabled
                        className="mb-3 w-full rounded-full bg-[#3D3B3A] px-6 py-4 text-sm font-medium text-[#E2A9F1] opacity-40"
                    >
                        View Pair
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="w-full rounded-full px-6 py-3 text-sm text-[#3D3B3A]/55"
                >
                    Keep discovering
                </button>
            </motion.div>
        </motion.div>
    )
}