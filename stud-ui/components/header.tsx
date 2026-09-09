"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Menu, X, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault()

    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 100
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY

      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      })

      setIsOpen(false)
    }
  }

  const handleLogoClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault()

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">

      <div
        className={`
          max-w-7xl
          mx-auto
          rounded-2xl
          px-6
          py-3
          transition-all
          duration-500
          backdrop-blur-xl
          border

          ${isScrolled
            ? "bg-stud-bg/90 border-stud-ink/10 shadow-sm"
            : "bg-black/15 border-white/25"
          }
        `}
      >

        <div className="flex items-center justify-between">

          {/* Logo */}
          <a
            href="#"
            onClick={handleLogoClick}
            className="cursor-pointer"
          >
            <span
              className={`
                text-xl
                font-semibold
                tracking-tight
                transition-colors
                duration-300

                ${isScrolled
                  ? "text-stud-ink"
                  : "text-white"
                }
              `}
            >
              STUD
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">

            <NavLink
              label="How it works"
              target="how-it-works"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <NavLink
              label="Pair"
              target="features"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <NavLink
              label="Markets"
              target="pricing"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <NavLink
              label="Reputation"
              target="testimonials"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <NavLink
              label="FAQ"
              target="faq"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

          </nav>

          {/* Launch button */}
          <div className="hidden md:flex items-center">

            <button
              className={`
                flex
                items-center
                gap-2
                rounded-full
                pl-5
                pr-2
                py-2
                transition-all
                duration-300
                group

                ${isScrolled
                  ? "bg-stud-ink text-stud-bg hover:bg-stud-dark"
                  : "bg-white text-stud-ink hover:bg-white/90"
                }
              `}
            >

              <Link
                href="/launch"
                className="text-sm font-medium"
              >
                Launch Stud
              </Link>

              <span
                className={`
                  w-7
                  h-7
                  rounded-full
                  flex
                  items-center
                  justify-center

                  ${isScrolled
                    ? "bg-stud-bg"
                    : "bg-stud-bg"
                  }
                `}
              >
                <ArrowUpRight className="w-4 h-4 text-stud-ink transition-transform duration-300 group-hover:rotate-45" />
              </span>

            </button>

          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              md:hidden
              transition-colors

              ${isScrolled
                ? "text-stud-ink"
                : "text-white"
              }
            `}
          >
            {isOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav
            className={`
              md:hidden
              mt-6
              pb-4
              pt-6
              flex
              flex-col
              gap-4
              border-t

              ${isScrolled
                ? "border-stud-ink/10"
                : "border-white/20"
              }
            `}
          >

            <MobileLink
              label="How it works"
              target="how-it-works"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <MobileLink
              label="Pair"
              target="features"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <MobileLink
              label="Markets"
              target="pricing"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <MobileLink
              label="Reputation"
              target="testimonials"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <MobileLink
              label="FAQ"
              target="faq"
              isScrolled={isScrolled}
              onClick={handleSmoothScroll}
            />

            <button
              className={`
                mt-3
                flex
                items-center
                justify-between
                rounded-full
                pl-5
                pr-2
                py-2
                w-fit

                ${isScrolled
                  ? "bg-stud-ink text-stud-bg"
                  : "bg-white text-stud-ink"
                }
              `}
            >
              <Link
                href="/launch"
                className="text-sm font-medium"
              >
                Launch Stud
              </Link>

              <span className="w-7 h-7 ml-3 rounded-full bg-stud-bg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-stud-ink" />
              </span>
            </button>

          </nav>
        )}

      </div>
    </header>
  )
}

function NavLink({
  label,
  target,
  isScrolled,
  onClick,
}: {
  label: string
  target: string
  isScrolled: boolean
  onClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => void
}) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => onClick(e, target)}
      className={`
        text-sm
        transition-colors
        duration-300

        ${isScrolled
          ? "text-stud-ink/70 hover:text-stud-ink"
          : "text-white/75 hover:text-white"
        }
      `}
    >
      {label}
    </a>
  )
}

function MobileLink({
  label,
  target,
  isScrolled,
  onClick,
}: {
  label: string
  target: string
  isScrolled: boolean
  onClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => void
}) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => onClick(e, target)}
      className={
        isScrolled
          ? "text-stud-ink/70 hover:text-stud-ink"
          : "text-white/75 hover:text-white"
      }
    >
      {label}
    </a>
  )
}