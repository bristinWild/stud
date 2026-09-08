"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let rafId: number
    let currentProgress = 0

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = 400
      const targetProgress = Math.min(scrollY / maxScroll, 1)

      const smoothUpdate = () => {
        currentProgress += (targetProgress - currentProgress) * 0.1

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
          setScrollProgress(currentProgress)
          rafId = requestAnimationFrame(smoothUpdate)
        } else {
          setScrollProgress(targetProgress)
        }
      }

      cancelAnimationFrame(rafId)
      smoothUpdate()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const easeOutQuad = (t: number) => t * (2 - t)
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  const scale = 1 - easeOutQuad(scrollProgress) * 0.15
  const borderRadius = easeOutCubic(scrollProgress) * 48
  const heightVh = 100 - easeOutQuad(scrollProgress) * 37.5

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">

      {/* VIDEO */}
      <div className="absolute inset-0">
        <div
          className="relative w-full overflow-hidden will-change-transform"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${borderRadius}px`,
            height: `${heightVh}vh`,
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/stud-hero.mp4"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-6">

        <div className="text-center max-w-6xl mx-auto">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 text-xs sm:text-sm tracking-[0.35em] uppercase text-white/75 font-medium"
          >
            World ID Verified Social Markets
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              font-serif
              text-[3.4rem]
              sm:text-[4.7rem]
              md:text-[6rem]
              lg:text-[7rem]
              font-normal
              leading-[0.88]
              tracking-tight
              text-white
              text-balance
              drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]
            "
          >
            Match. Build.
            <br />
            Become a market.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
            className="
              mt-8
              max-w-2xl
              mx-auto
              text-base
              sm:text-lg
              text-white/75
              leading-relaxed
            "
          >
            Match with verified humans, create a shared onchain identity,
            build reputation together, and unlock deeper markets over time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button className="rounded-full bg-white text-stud-ink px-6 py-3 text-sm font-medium hover:bg-white/90 transition">
              Launch Stud
            </button>

            <a
              href="#how-it-works"
              className="rounded-full border border-white/30 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition"
            >
              See how it works
            </a>
          </motion.div>

        </div>
      </div>

    </section>
  )
}