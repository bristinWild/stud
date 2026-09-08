import Link from "next/link"
import {
  Twitter,
  Linkedin,
  Instagram,
  Github,
  ArrowUpRight,
} from "lucide-react"
import Image from "next/image"

const footerLinks = {
  product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Pair Identity", href: "#features" },
    { label: "Pair Markets", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],

  protocol: [
    { label: "World ID", href: "#" },
    { label: "Reputation", href: "#features" },
    { label: "Milestones", href: "#features" },
    { label: "Graduation", href: "#pricing" },
  ],

  resources: [
    { label: "Documentation", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "ETHGlobal", href: "#" },
    { label: "Demo", href: "#" },
  ],

  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Risk Disclosure", href: "#" },
    { label: "Market Disclaimer", href: "#" },
  ],
}

export function Footer() {
  return (
    <div className="relative">
      {/* =========================
          VISUAL FOOTER BANNER
      ========================== */}
      <div className="relative h-[42vw] min-h-[320px] max-h-[580px] overflow-hidden">
        <Image
          src="/images/footer-bg.jpg"
          alt="Stud community"
          fill
          className="object-cover"
        />

        {/* Dark / Stud tint */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-stud-bg/10" />

        {/* Small message */}
        <div className="absolute left-1/2 top-12 z-10 -translate-x-1/2 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
            Verified humans. Shared identities.
          </p>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            Match with real people, build reputation together, and create
            something that lives beyond the match.
          </p>
        </div>

        {/* Giant STUD */}
        <div className="absolute bottom-[-1.5vw] left-0 right-0 z-10 flex justify-center">
          <h2 className="whitespace-nowrap text-center text-[25vw] font-bold leading-[0.72] tracking-[-0.08em] text-white">
            STUD
          </h2>
        </div>
      </div>

      {/* =========================
          ACTUAL FOOTER
      ========================== */}
      <footer
        id="contact"
        className="relative border-t border-stud-ink/10 bg-background px-6 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-5">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="mb-5 inline-flex items-center">
                <span className="text-xl font-semibold tracking-[-0.04em] text-stud-ink">
                  STUD
                </span>
              </Link>

              <p className="mb-6 max-w-[220px] text-sm leading-relaxed text-stud-ink/50">
                World ID–verified social markets built around real human
                connections.
              </p>

              {/* Socials */}
              <div className="flex gap-3">
                <SocialLink>
                  <Twitter className="h-4 w-4" />
                </SocialLink>

                <SocialLink>
                  <Github className="h-4 w-4" />
                </SocialLink>

                <SocialLink>
                  <Linkedin className="h-4 w-4" />
                </SocialLink>

                <SocialLink>
                  <Instagram className="h-4 w-4" />
                </SocialLink>
              </div>
            </div>

            {/* Product */}
            <FooterColumn
              title="Product"
              links={footerLinks.product}
            />

            {/* Protocol */}
            <FooterColumn
              title="Protocol"
              links={footerLinks.protocol}
            />

            {/* Resources */}
            <FooterColumn
              title="Resources"
              links={footerLinks.resources}
            />

            {/* Legal */}
            <FooterColumn
              title="Legal"
              links={footerLinks.legal}
            />
          </div>

          {/* Launch strip */}
          <div className="mb-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-stud-ink/10 bg-stud-light/40 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-lg font-medium text-stud-ink">
                Ready to enter Stud?
              </p>

              <p className="text-sm text-stud-ink/50">
                Verify as a unique human and start matching.
              </p>
            </div>

            <button className="group flex items-center gap-3 rounded-full bg-stud-ink py-2 pl-5 pr-2 text-sm font-medium text-stud-bg transition-transform duration-300 hover:scale-[1.02]">
              Launch Stud

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stud-bg">
                <ArrowUpRight className="h-4 w-4 text-stud-ink" />
              </span>
            </button>
          </div>

          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-stud-ink/10 pt-8 md:flex-row">
            <p className="text-xs text-stud-ink/40">
              © 2026 Stud. Built for ETHGlobal.
            </p>

            <p className="text-xs text-stud-ink/40">
              Reputation changes permissions. Markets change price.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: {
    label: string
    href: string
  }[]
}) {
  return (
    <div>
      <h4 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-stud-ink">
        {title}
      </h4>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-stud-ink/50 transition-colors hover:text-stud-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLink({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Link
      href="#"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-stud-ink/10 text-stud-ink/50 transition-all duration-300 hover:border-stud-ink/25 hover:bg-stud-ink hover:text-stud-bg"
    >
      {children}
    </Link>
  )
}