"use client"

import {
  ArrowUpRight,
  HeartHandshake,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const pairs = [
  {
    names: "Alice × Bob",
    token: "$ALICEBOB",
    initials: ["A", "B"],
    reputation: 42,
    stage: "Growing",
    capacity: "$2,000",
    milestones: 4,
  },
  {
    names: "Kai × Noah",
    token: "$KaiNOAH",
    initials: ["M", "N"],
    reputation: 67,
    stage: "Established",
    capacity: "$10,000",
    milestones: 9,
  },
  {
    names: "Lena × Kai",
    token: "$LENAKAI",
    initials: ["L", "K"],
    reputation: 18,
    stage: "New Pair",
    capacity: "$500",
    milestones: 2,
  },
  {
    names: "Zara × Leo",
    token: "$ZARALEO",
    initials: ["Z", "L"],
    reputation: 74,
    stage: "Graduation Eligible",
    capacity: "Open",
    milestones: 13,
  },
  {
    names: "Ivy × Theo",
    token: "$IVYTHEO",
    initials: ["I", "T"],
    reputation: 51,
    stage: "Established",
    capacity: "$10,000",
    milestones: 7,
  },
]

export function PricingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const positionRef = useRef(0)

  const [isHovered, setIsHovered] = useState(false)

  const duplicatedPairs = [...pairs, ...pairs, ...pairs]

  useEffect(() => {
    const container = scrollRef.current

    if (!container) return

    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      const speed = isHovered ? 0.18 : 0.7

      positionRef.current += speed * (deltaTime / 16)

      const singleSetWidth = container.scrollWidth / 3

      if (positionRef.current >= singleSetWidth) {
        positionRef.current = 0
      }

      container.style.transform = `translateX(-${positionRef.current}px)`

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHovered])

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-32"
    >
      {/* Background word */}
      <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 select-none">
        <span className="whitespace-nowrap text-[16vw] font-bold leading-none tracking-[-0.07em] text-[rgba(61,59,58,0.03)]">
          MARKETS
        </span>
      </div>

      {/* Heading */}
      <div className="relative z-10 mx-auto mb-20 max-w-7xl px-6 text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stud-ink/50">
          Pair Markets
        </p>

        <h2 className="mb-6 text-balance font-serif text-4xl font-normal text-stud-ink md:text-5xl lg:text-6xl">
          Every Pair has its own
          <br className="hidden sm:block" />
          {" "}economic journey.
        </h2>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stud-ink/60">
          As a Pair builds reputation, Stud progressively expands the economic
          permissions available to it from small controlled markets toward
          deeper liquidity.
        </p>

        <p className="mt-4 text-xs text-stud-ink/35">
          Illustrative demo Pair data
        </p>
      </div>

      {/* Moving carousel */}
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Soft side fades */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-20 bg-gradient-to-r from-background to-transparent md:w-40" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-20 bg-gradient-to-l from-background to-transparent md:w-40" />

        <div
          ref={scrollRef}
          className="flex gap-6 will-change-transform"
          style={{ width: "fit-content" }}
        >
          {duplicatedPairs.map((pair, index) => (
            <div
              key={`${pair.token}-${index}`}
              className="w-[85vw] flex-shrink-0 sm:w-[55vw] lg:w-[390px]"
            >
              <PairMarketCard pair={pair} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PairMarketCard({
  pair,
}: {
  pair: {
    names: string
    token: string
    initials: string[]
    reputation: number
    stage: string
    capacity: string
    milestones: number
  }
}) {
  return (
    <div className="group h-full rounded-[2rem] border border-stud-ink/10 bg-stud-light/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-stud-light/70 hover:shadow-xl">
      {/* Top */}
      <div className="mb-8 flex items-start justify-between">
        {/* Avatars */}
        <div className="flex items-center">
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-stud-bg text-sm font-medium text-stud-ink">
            {pair.initials[0]}
          </div>

          <div className="-ml-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-stud-ink text-sm font-medium text-stud-bg">
            {pair.initials[1]}
          </div>
        </div>

        <div className="rounded-full border border-stud-ink/10 px-3 py-1.5 text-[11px] text-stud-ink/55">
          {pair.stage}
        </div>
      </div>

      {/* Pair identity */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stud-ink/40">
          <HeartHandshake className="h-4 w-4" />
          Pair identity
        </div>

        <h3 className="text-2xl font-medium text-stud-ink">
          {pair.names}
        </h3>

        <p className="mt-1 text-sm text-stud-ink/45">
          {pair.token}
        </p>
      </div>

      {/* Reputation */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-stud-ink/50">
            Reputation
          </span>

          <span className="font-medium text-stud-ink">
            {pair.reputation} / 100
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-stud-ink/10">
          <div
            className="h-full rounded-full bg-stud-ink transition-all duration-700"
            style={{
              width: `${pair.reputation}%`,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stud-ink/8 bg-background/50 p-4">
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-stud-ink/35">
            Market capacity
          </p>

          <p className="text-xl font-medium text-stud-ink">
            {pair.capacity}
          </p>
        </div>

        <div className="rounded-2xl border border-stud-ink/8 bg-background/50 p-4">
          <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-stud-ink/35">
            Milestones
          </p>

          <p className="text-xl font-medium text-stud-ink">
            {pair.milestones}
          </p>
        </div>
      </div>

      {/* Growth */}
      <div className="mb-6 flex items-center gap-2 text-xs text-stud-ink/45">
        <TrendingUp className="h-4 w-4" />

        Reputation unlocks larger markets
      </div>

      {/* View pair */}
      <button className="flex w-full items-center justify-between rounded-full border border-stud-ink/10 py-2 pl-5 pr-2 text-sm text-stud-ink transition-colors duration-300 hover:bg-stud-ink hover:text-stud-bg">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          View Pair
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stud-ink text-stud-bg transition-all duration-300 group-hover:bg-stud-bg group-hover:text-stud-ink">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  )
}