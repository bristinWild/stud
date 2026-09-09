"use client"

import {
  BadgeCheck,
  Check,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react"
import { motion } from "framer-motion"

const features = [
  "World ID verified humans",
  "Mutual match required",
  "A new Pair identity is created onchain",
  "Shared reputation evolves over time",
  "Milestones require acceptance from both people",
  "Higher reputation unlocks larger market capacity",
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden px-6 py-32"
    >
      {/* Background editorial word */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        <span className="whitespace-nowrap text-[22vw] font-bold leading-none tracking-[-0.08em] text-[rgba(61,59,58,0.035)]">
          PAIR
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* LEFT — Pair visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.3 }}
            className="order-2 lg:order-1"
          >
            <div className="relative mx-auto max-w-xl rounded-[2rem] border border-stud-ink/10 bg-stud-light/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">

              {/* People */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

                {/* Alice */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-stud-ink/10 bg-background/80 p-5"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-stud-bg">
                    <UserRound
                      className="h-6 w-6 text-stud-ink"
                      strokeWidth={1.5}
                    />
                  </div>

                  <p className="text-lg font-medium text-stud-ink">
                    Alice
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-stud-ink/55">
                    <BadgeCheck className="h-4 w-4" />
                    World ID verified
                  </div>
                </motion.div>

                {/* Connector */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.45,
                    type: "spring",
                  }}
                  viewport={{ once: true }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-stud-ink text-stud-bg"
                >
                  <HeartHandshake
                    className="h-5 w-5"
                    strokeWidth={1.5}
                  />
                </motion.div>

                {/* Bob */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-stud-ink/10 bg-background/80 p-5"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-stud-bg">
                    <UserRound
                      className="h-6 w-6 text-stud-ink"
                      strokeWidth={1.5}
                    />
                  </div>

                  <p className="text-lg font-medium text-stud-ink">
                    Bob
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-stud-ink/55">
                    <BadgeCheck className="h-4 w-4" />
                    World ID verified
                  </div>
                </motion.div>
              </div>

              {/* Vertical connection */}
              <div className="my-5 flex justify-center">
                <div className="h-10 w-px bg-stud-ink/15" />
              </div>

              {/* Pair card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                viewport={{ once: true }}
                className="rounded-3xl bg-stud-ink p-6 text-stud-bg sm:p-7"
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.2em] text-stud-bg/60">
                        Pair Identity
                      </span>
                    </div>

                    <h3 className="text-3xl font-medium tracking-tight">
                      $ALICEBOB
                    </h3>
                  </div>

                  <div className="rounded-full border border-stud-bg/20 px-3 py-1.5 text-xs text-stud-bg/70">
                    Growing Pair
                  </div>
                </div>

                {/* Reputation */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-stud-bg/60">
                      Pair reputation
                    </span>
                    <span>42 / 100</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-stud-bg/15">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "42%" }}
                      transition={{
                        duration: 1,
                        delay: 0.8,
                        ease: "easeOut",
                      }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-stud-bg"
                    />
                  </div>
                </div>

                {/* Pair stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-stud-bg/10 p-4">
                    <p className="mb-1 text-xs text-stud-bg/50">
                      Market capacity
                    </p>
                    <p className="text-xl font-medium">
                      $2,000
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stud-bg/10 p-4">
                    <p className="mb-1 text-xs text-stud-bg/50">
                      Milestones
                    </p>
                    <p className="text-xl font-medium">
                      4 completed
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-stud-bg/50">
                  <TrendingUp className="h-4 w-4" />
                  More reputation unlocks deeper markets
                </div>
              </motion.div>

              <p className="mt-4 text-center text-[11px] text-stud-ink/35">
                Illustrative Pair profile
              </p>
            </div>
          </motion.div>

          {/* RIGHT — explanation */}
          <div className="order-1 space-y-8 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stud-ink/50">
                Pair identity
              </p>

              <h2 className="mb-6 max-w-xl text-balance font-serif text-4xl font-normal text-stud-ink md:text-5xl lg:text-6xl">
                Two people.
                <br />
                One new identity.
              </h2>

              <p className="max-w-xl text-lg leading-relaxed text-stud-ink/60">
                When two verified people mutually match, Stud creates a new
                shared onchain identity, Pair that can build its own
                reputation, complete milestones, and develop an economic
                lifecycle separate from either individual.
              </p>
            </motion.div>

            {/* Features */}
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                  }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 rounded-2xl p-3 transition-colors duration-300 hover:bg-stud-light"
                >
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-stud-ink">
                    <Check
                      className="h-3.5 w-3.5 text-stud-bg"
                      strokeWidth={2.5}
                    />
                  </div>

                  <span className="text-sm leading-relaxed text-stud-ink/75">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Small explanation */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              viewport={{ once: true }}
              className="border-t border-stud-ink/10 pt-6"
            >
              <p className="max-w-lg text-sm leading-relaxed text-stud-ink/45">
                The Pair does not inherit a guaranteed market value. Reputation
                controls what economic opportunities the protocol allows,
                while actual token price is determined by market demand.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}