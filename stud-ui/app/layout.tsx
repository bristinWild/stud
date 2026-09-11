import type React from "react"

import type {
  Metadata,
} from "next"

import {
  Inter,
  Geist_Mono,
  Playfair_Display,
} from "next/font/google"

import {
  Analytics,
} from "@vercel/analytics/next"

import {
  WalletProvider,
} from "@/components/wallet-provider"

import "./globals.css"

const _inter =
  Inter({
    subsets: [
      "latin",
    ],
  })

const _geistMono =
  Geist_Mono({
    subsets: [
      "latin",
    ],
  })

const _playfair =
  Playfair_Display({
    subsets: [
      "latin",
    ],
  })

export const metadata:
  Metadata = {
  title:
    "Stud - The onchain dating app",

  description:
    "Connect with real people, build reputation together, and create something that lives beyond the match.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children:
  React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">

        <WalletProvider>
          {
            children
          }
        </WalletProvider>

        <Analytics />

      </body>
    </html>
  )
}