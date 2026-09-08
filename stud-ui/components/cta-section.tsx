import {
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  TrendingUp,
} from "lucide-react"

export function CTASection() {
  return (
    <section
      id="markets"
      className="relative overflow-hidden px-6 py-32"
    >
      {/* Large background word */}
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
        <span className="whitespace-nowrap text-[20vw] font-bold leading-none tracking-[-0.08em] text-[rgba(61,59,58,0.035)]">
          LAUNCH
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Main CTA */}
        <div className="mb-24 text-center">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-stud-ink/50">
            Ready to enter Stud?
          </p>

          <h2 className="mx-auto mb-6 max-w-4xl text-balance font-serif text-4xl font-normal leading-tight text-stud-ink md:text-5xl lg:text-6xl">
            Your next match could become
            <br className="hidden sm:block" />
            {" "}something bigger.
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-stud-ink/60">
            Verify with World ID, meet real people, create a Pair together,
            build reputation, and unlock an evolving onchain market.
          </p>

          {/* Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="group relative flex items-center justify-center gap-0 overflow-hidden rounded-full bg-stud-ink py-1.5 pl-6 pr-1.5 text-stud-bg transition-all duration-300 hover:scale-[1.02]">
              <span className="pr-4 text-sm font-medium">
                Launch Stud
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stud-bg">
                <ArrowUpRight className="h-4 w-4 text-stud-ink" />
              </span>
            </button>

            <a
              href="#how-it-works"
              className="group relative flex items-center justify-center gap-0 overflow-hidden rounded-full border border-stud-ink/15 py-1.5 pl-6 pr-1.5 transition-all duration-300"
            >
              <span className="absolute inset-0 origin-right scale-x-0 rounded-full bg-stud-ink transition-transform duration-300 group-hover:scale-x-100" />

              <span className="relative z-10 pr-4 text-sm font-medium text-stud-ink transition-colors duration-300 group-hover:text-stud-bg">
                See how it works
              </span>

              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full">
                <ArrowRight className="absolute h-4 w-4 text-stud-ink transition-opacity duration-300 group-hover:opacity-0" />

                <ArrowUpRight className="h-4 w-4 text-stud-bg opacity-0 transition-all duration-300 group-hover:opacity-100" />
              </span>
            </a>
          </div>
        </div>

        {/* Protocol principles */}
        <div className="grid gap-6 border-t border-stud-ink/10 pt-16 md:grid-cols-3">

          {/* Verified */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-stud-ink/10 bg-stud-light/60">
              <BadgeCheck
                className="h-5 w-5 text-stud-ink"
                strokeWidth={1.5}
              />
            </div>

            <p className="mb-2 text-4xl font-light text-stud-ink">
              1 : 1
            </p>

            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stud-ink/45">
              Human verification
            </p>

            <p className="mx-auto max-w-xs text-sm leading-relaxed text-stud-ink/50">
              One World ID represents one unique human participating in Stud.
            </p>
          </div>

          {/* Match */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-stud-ink/10 bg-stud-light/60">
              <HeartHandshake
                className="h-5 w-5 text-stud-ink"
                strokeWidth={1.5}
              />
            </div>

            <p className="mb-2 text-4xl font-light text-stud-ink">
              2 → 1
            </p>

            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stud-ink/45">
              Match becomes Pair
            </p>

            <p className="mx-auto max-w-xs text-sm leading-relaxed text-stud-ink/50">
              Two verified people mutually match and create one new shared
              onchain identity.
            </p>
          </div>

          {/* Reputation */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-stud-ink/10 bg-stud-light/60">
              <TrendingUp
                className="h-5 w-5 text-stud-ink"
                strokeWidth={1.5}
              />
            </div>

            <p className="mb-2 text-4xl font-light text-stud-ink">
              REP ↑
            </p>

            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stud-ink/45">
              Markets unlock
            </p>

            <p className="mx-auto max-w-xs text-sm leading-relaxed text-stud-ink/50">
              Growing Pair reputation unlocks progressively larger market
              permissions and deeper liquidity.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}