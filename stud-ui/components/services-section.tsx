"use client"

import { ShieldCheck, HeartHandshake, TrendingUp } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react"

const services = [
  {
    icon: ShieldCheck,
    title: "Verify",
    description:
      "World ID confirms every Stud is a unique human , reducing bots, duplicate accounts, and fake participation.",
  },
  {
    icon: HeartHandshake,
    title: "Match & Create",
    description:
      "When two verified people mutually match, Stud creates a new shared onchain identity called a Pair.",
  },
  {
    icon: TrendingUp,
    title: "Build & Unlock",
    description:
      "Complete mutually accepted milestones, grow Pair reputation, and unlock larger markets and deeper liquidity.",
  },
]

function AnimatedIcon({
  Icon,
}: {
  Icon: ComponentType<{
    className?: string
    strokeWidth?: number
    style?: CSSProperties
  }>
}) {
  const [isVisible, setIsVisible] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.3,
      }
    )

    if (iconRef.current) {
      observer.observe(iconRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={iconRef} className="relative">
      <Icon
        className={`h-16 w-16 text-stud-ink ${isVisible ? "animate-draw-icon" : ""
          }`}
        strokeWidth={1}
        style={{
          strokeDasharray: isVisible ? undefined : 1000,
          strokeDashoffset: isVisible ? undefined : 1000,
        }}
      />
    </div>
  )
}

export function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.2,
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-6 pt-24 pb-24"
    >
      {/* Large background title */}
      <div className="pointer-events-none absolute left-1/2 top-20 z-0 -translate-x-1/2">
        <span className="whitespace-nowrap text-[9vw] font-bold leading-none tracking-[-0.06em] text-[rgba(61,59,58,0.045)]">
          HOW IT WORKS
        </span>
      </div>

      {/* Icon draw animation */}
      <style jsx>{`
        @keyframes drawPath {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }

          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        :global(.animate-draw-icon) :global(path),
        :global(.animate-draw-icon) :global(line),
        :global(.animate-draw-icon) :global(polyline),
        :global(.animate-draw-icon) :global(circle),
        :global(.animate-draw-icon) :global(rect) {
          animation: drawPath 2s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Main image story card */}
        <div
          ref={sectionRef}
          className="relative mt-28 mb-24 min-h-[520px] overflow-hidden rounded-3xl px-6 py-16 lg:px-10 lg:py-20"
        >
          {/* Background image */}
          <div className="absolute inset-0 h-full w-full">
            <img
              src="/images/stud-pair.jpg"
              alt="Two verified people forming a Stud Pair"
              className={`h-full w-full object-cover transition-transform duration-1000 ease-out ${isVisible ? "scale-100" : "scale-110"
                }`}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Slight Stud tint */}
            <div className="absolute inset-0 bg-stud-bg/10" />
          </div>

          {/* Text content */}
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Keep empty left side for image composition */}
            <div className="hidden lg:block" />

            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                The core idea
              </p>

              <h2 className="mb-8 max-w-xl text-balance font-sans text-4xl font-medium text-white md:text-5xl lg:text-6xl">
                A match becomes something more.
              </h2>

              <div className="max-w-xl space-y-6 leading-relaxed text-white/80">
                <p>
                  Stud starts like a social app. Real people verify through
                  World ID, discover each other, and mutually match.
                </p>

                <p>
                  But when two people match, their connection becomes its own
                  onchain identity , Pair with a token, reputation,
                  milestones, and an economic lifecycle of its own.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section intro */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stud-ink/50">
            The Stud flow
          </p>

          <h2 className="mb-6 text-balance font-serif text-4xl font-normal text-stud-ink md:text-5xl">
            From match to market
          </h2>

          <p className="mx-auto max-w-2xl leading-relaxed text-stud-ink/60">
            A verified social connection becomes an evolving onchain Pair that
            builds reputation and unlocks progressively larger economic
            opportunities.
          </p>
        </div>

        {/* 3 steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative rounded-3xl border border-stud-ink/10 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-stud-light hover:shadow-lg"
            >
              {/* Step number */}
              <div className="absolute right-6 top-5 text-xs font-medium tracking-[0.2em] text-stud-ink/30">
                0{index + 1}
              </div>

              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-stud-ink/10 bg-stud-light/50 transition-transform duration-300 group-hover:scale-105">
                  <AnimatedIcon Icon={service.icon} />
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-medium text-stud-ink">
                {service.title}
              </h3>

              <p className="text-sm leading-relaxed text-stud-ink/60">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom mini flow */}
        <div className="mt-20 hidden items-center justify-center gap-4 text-sm text-stud-ink/50 md:flex">
          <span>World ID</span>

          <span className="text-stud-ink/30">→</span>

          <span>Mutual Match</span>

          <span className="text-stud-ink/30">→</span>

          <span>Pair Identity</span>

          <span className="text-stud-ink/30">→</span>

          <span>Reputation</span>

          <span className="text-stud-ink/30">→</span>

          <span>Markets</span>
        </div>
      </div>
    </section>
  )
}