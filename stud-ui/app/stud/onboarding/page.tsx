"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    ShieldCheck,
    UserRound,
} from "lucide-react"

type Gender = "Man" | "Woman"

export default function StudOnboardingPage() {
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [verified, setVerified] = useState(false)

    const [isSliding, setIsSliding] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)

    const [name, setName] = useState("")
    const [age, setAge] = useState("")
    const [gender, setGender] = useState<Gender | null>(null)

    const preference: Gender | null =
        gender === "Man" ? "Woman" : gender === "Woman" ? "Man" : null

    const canContinueProfile =
        name.trim().length > 1 &&
        Number(age) >= 18 &&
        gender !== null

    const finishOnboarding = () => {
        // Later:
        // save Stud profile to DB / contract

        router.push("/stud/discover")
    }

    const handleVerifyAndContinue = async () => {
        if (isVerifying || isSliding) return

        // Mock World ID verification
        if (!verified) {
            setIsVerifying(true)

            await new Promise((resolve) => setTimeout(resolve, 600))

            setVerified(true)
            setIsVerifying(false)

            // Briefly show the verified state
            await new Promise((resolve) => setTimeout(resolve, 350))
        }

        // Start slider animation
        setIsSliding(true)

        await new Promise((resolve) => setTimeout(resolve, 550))

        setStep(2)
        setIsSliding(false)
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 py-8">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-stud-bg/25 blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
                <button
                    onClick={() => router.push("/launch")}
                    className="flex items-center gap-2 text-sm text-stud-ink/55 transition-colors hover:text-stud-ink"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="text-xl font-semibold tracking-[-0.04em] text-stud-ink"
                >
                    STUD
                </button>

                <div className="flex items-center gap-2 text-xs text-stud-ink/45">
                    <BadgeCheck className="h-4 w-4" />
                    World ID
                </div>
            </header>

            <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-6xl items-center gap-16 py-12 lg:grid-cols-[1.05fr_0.95fr]">
                {/* LEFT */}
                <div>
                    {/* Progress */}
                    <div className="mb-12 flex items-center gap-3">
                        <StepIndicator
                            number="01"
                            label="Verify"
                            active={step === 1}
                            complete={step > 1}
                        />

                        <div className="h-px w-10 bg-stud-ink/10" />

                        <StepIndicator
                            number="02"
                            label="Profile"
                            active={step === 2}
                            complete={false}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stud-ink/45">
                                    Become a verified Stud
                                </p>

                                <h1 className="mb-6 max-w-xl font-serif text-5xl leading-[0.95] text-stud-ink md:text-6xl">
                                    Real people.
                                    <br />
                                    Better matches.
                                </h1>

                                <p className="mb-10 max-w-lg text-lg leading-relaxed text-stud-ink/55">
                                    Stud uses World ID to make sure every profile begins with a
                                    unique human.
                                </p>

                                {/* Verification box */}
                                <div className="max-w-lg rounded-[2rem] border border-stud-ink/10 bg-stud-light/40 p-6">
                                    <div className="mb-8 flex items-start justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stud-ink text-stud-bg">
                                            <ShieldCheck
                                                className="h-5 w-5"
                                                strokeWidth={1.5}
                                            />
                                        </div>

                                        {verified && (
                                            <div className="flex items-center gap-2 rounded-full bg-stud-ink px-3 py-1.5 text-xs text-stud-bg">
                                                <Check className="h-3.5 w-3.5" />
                                                Verified
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="mb-2 mt-6 text-xl font-medium text-[#3D3B3A]">
                                        Verify unique humanity
                                    </h2>

                                    <p className="mb-7 text-sm leading-relaxed text-stud-ink/50">
                                        World ID helps prevent duplicate accounts, bots, and fake
                                        participants without exposing your identity publicly.
                                    </p>

                                    <button
                                        onClick={handleVerifyAndContinue}
                                        disabled={isVerifying || isSliding}
                                        className="relative flex h-14 w-full items-center overflow-hidden rounded-full bg-[#3D3B3A] px-5 text-sm font-medium text-[#F2D8F8]"
                                    >
                                        {/* Sliding lavender background */}
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                scaleX: isSliding ? 1 : 0,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.76, 0, 0.24, 1],
                                            }}
                                            className="absolute inset-0 origin-right bg-[#E2A9F1]"
                                        />

                                        {/* Button text */}
                                        <motion.span
                                            animate={{
                                                color: isSliding ? "#3D3B3A" : "#F2D8F8",
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="relative z-10"
                                        >
                                            {isVerifying
                                                ? "Verifying..."
                                                : verified
                                                    ? "Verified"
                                                    : "Verify with World ID"}
                                        </motion.span>

                                        {/* Slider knob */}
                                        <motion.span
                                            initial={false}
                                            animate={{
                                                left: isSliding ? "8px" : "calc(100% - 48px)",
                                                rotate: isSliding ? 180 : 0,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.76, 0, 0.24, 1],
                                            }}
                                            className="absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#E2A9F1]"
                                        >
                                            {verified && !isSliding ? (
                                                <Check className="h-4 w-4 text-[#3D3B3A]" />
                                            ) : (
                                                <ArrowRight className="h-4 w-4 text-[#3D3B3A]" />
                                            )}
                                        </motion.span>
                                    </button>
                                </div>

                                <p className="mt-4 max-w-lg text-xs leading-relaxed text-stud-ink/35">
                                    Verification is mocked for the UI right now. We&apos;ll wire
                                    the actual World ID flow afterward.
                                </p>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stud-ink/45">
                                    Your profile
                                </p>

                                <h1 className="mb-6 font-serif text-5xl leading-[0.95] text-stud-ink md:text-6xl">
                                    Tell people
                                    <br />
                                    who you are.
                                </h1>

                                <p className="mb-10 max-w-lg text-lg text-stud-ink/55">
                                    Just enough to create your first Stud profile.
                                </p>

                                <div className="max-w-xl space-y-7">
                                    {/* Name + age */}
                                    <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                                        <div>
                                            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-stud-ink/45">
                                                First name
                                            </label>

                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Alice"
                                                className="w-full rounded-2xl border border-stud-ink/10 bg-transparent px-5 py-4 text-stud-ink outline-none transition-colors placeholder:text-stud-ink/25 focus:border-stud-ink/30"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-stud-ink/45">
                                                Age
                                            </label>

                                            <input
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                type="number"
                                                min={18}
                                                placeholder="24"
                                                className="w-full rounded-2xl border border-stud-ink/10 bg-transparent px-5 py-4 text-stud-ink outline-none placeholder:text-stud-ink/25 focus:border-stud-ink/30"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="mb-3 block text-xs uppercase tracking-[0.16em] text-stud-ink/45">
                                            I am
                                        </label>

                                        <div className="grid grid-cols-2 gap-3">
                                            {(["Man", "Woman"] as Gender[]).map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setGender(option)}
                                                    className={`rounded-2xl border px-5 py-4 text-left text-sm transition-all ${gender === option
                                                        ? "border-stud-ink bg-stud-ink text-stud-bg"
                                                        : "border-stud-ink/10 text-stud-ink hover:bg-stud-light/60"
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Discovery preference */}
                                    {preference && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="rounded-2xl border border-stud-ink/10 bg-stud-light/40 p-5"
                                        >
                                            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-stud-ink/40">
                                                Discovering
                                            </p>

                                            <p className="text-lg font-medium text-stud-ink">
                                                {preference === "Woman" ? "Women" : "Men"}
                                            </p>

                                            <p className="mt-1 text-xs text-stud-ink/40">
                                                For the current MVP, Stud uses opposite-gender
                                                discovery.
                                            </p>
                                        </motion.div>
                                    )}

                                    <button
                                        disabled={!canContinueProfile}
                                        onClick={finishOnboarding}
                                        className="flex w-full items-center justify-between rounded-full bg-stud-ink py-2 pl-6 pr-2 text-sm font-medium text-stud-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        Start discovering

                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stud-bg text-stud-ink">
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT — Profile preview */}
                <div className="hidden lg:block">
                    <ProfilePreview
                        name={name || "Alice"}
                        age={age || "24"}
                        gender={gender}
                        verified={verified}
                    />
                </div>
            </div>
        </main>
    )
}

function StepIndicator({
    number,
    label,
    active,
    complete,
}: {
    number: string
    label: string
    active: boolean
    complete: boolean
}) {
    return (
        <div
            className={`flex items-center gap-2 text-xs ${active || complete ? "text-stud-ink" : "text-stud-ink/30"
                }`}
        >
            <span>{complete ? "✓" : number}</span>
            <span className="uppercase tracking-[0.16em]">{label}</span>
        </div>
    )
}

function ProfilePreview({
    name,
    age,
    gender,
    verified,
}: {
    name: string
    age: string
    gender: Gender | null
    verified: boolean
}) {
    return (
        <motion.div
            layout
            className="relative mx-auto h-[610px] max-w-[430px] overflow-hidden rounded-[2.5rem] bg-[#3D3B3A] shadow-[0_30px_80px_rgba(61,59,58,0.18)]"
        >
            {/* Real profile image */}
            <img
                src="/images/alice-profile.jpg"
                alt="Stud profile"
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Bottom readability gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

            {/* Slight overall tint */}
            <div className="absolute inset-0 bg-black/5" />

            {/* Profile information */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-3xl font-medium">
                        {name}, {age}
                    </h2>

                    {verified && (
                        <BadgeCheck className="h-5 w-5 text-white" />
                    )}
                </div>

                <p className="text-sm text-white/70">
                    {gender || "Your profile"}
                </p>

                <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-5 text-xs text-white/65">
                    <ShieldCheck className="h-4 w-4" />
                    World ID verified profile
                </div>
            </div>
        </motion.div>
    )
}