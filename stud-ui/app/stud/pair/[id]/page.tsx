"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    ArrowUpRight,
    BadgeCheck,
    CheckCircle2,
    Clock,
    HeartHandshake,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react"

import { useEffect, useState } from "react"

type Proposal = {
  id: number
  title: string
  description: string
  proposer: string
  reward: string | null
  reputation: number
  deadline: string
  status: string
  acceptedByA: boolean
  acceptedByB: boolean
}

type ActiveMilestone = {
  id: number
  title: string
  description: string
  reputation: number
  reward: string | null
  deadline: string
  attestedByA: boolean
  attestedByB: boolean
}

const pairData = {
    "alice-leo": {
        id: "alice-leo",

        names: "Alice × Leo",
        token: "$ALICELEO",

        userA: {
            name: "Alice",
            image: "/images/alice-profile.jpg",
        },

        userB: {
            name: "Leo",
            image: "/images/profiles/leo.jpg",
        },

        reputation: 20,
        stage: "Growing Pair",

        capacity: 2000,
        reserve: 1120,

        completedMilestones: 2,

        proposals: [
            {
                id: 1,
                title: "Coffee challenge",
                description:
                    "Complete a coffee date together before September 12 and mutually attest completion.",
                proposer: "Community",
                reward: "20 USDC",
                reputation: 10,
                deadline: "Sep 12, 2026",
                status: "proposed",
                acceptedByA: false,

                // Leo already accepted
                acceptedByB: true,
            },

            {
                id: 2,
                title: "Seven-day activity streak",
                description:
                    "Complete at least one mutual check-in each day for seven consecutive days.",
                proposer: "Investor 0x72...91A",
                reward: null,
                reputation: 10,
                deadline: "Sep 18, 2026",
                status: "proposed",
                acceptedByA: false,
                acceptedByB: false,
            },
        ],

        activeMilestones: [
            {
                id: 3,
                title: "Three mutual check-ins",
                description:
                    "Complete three shared check-ins before the deadline.",
                reputation: 10,
                reward: null,
                deadline: "Sep 10, 2026",
                attestedByA: true,
                attestedByB: false,
            },
        ],

        history: [
            {
                id: 4,
                title: "First video call",
                completedAt: "Sep 6, 2026",
                reputation: 10,
            },

            {
                id: 5,
                title: "Shared playlist challenge",
                completedAt: "Sep 8, 2026",
                reputation: 10,
            },
        ],
    },

    "alice-noah": {
        id: "alice-noah",

        names: "Alice × Noah",
        token: "$ALICENOAH",

        userA: {
            name: "Alice",
            image: "/images/alice-profile.jpg",
        },

        userB: {
            name: "Noah",
            image: "/images/profiles/noah.jpg",
        },

        reputation: 40,
        stage: "Growing Pair",

        capacity: 2000,
        reserve: 1680,

        completedMilestones: 4,

        proposals: [
            {
                id: 1,
                title: "Weekend photo challenge",
                description:
                    "Take part in a shared weekend photo challenge and mutually attest completion.",
                proposer: "Community",
                reward: "15 USDC",
                reputation: 10,
                deadline: "Sep 15, 2026",
                status: "proposed",
                acceptedByA: false,
                acceptedByB: false,
            },
        ],

        activeMilestones: [
            {
                id: 2,
                title: "Mutual check-in",
                description:
                    "Complete one verified mutual check-in before September 11.",
                reputation: 10,
                reward: null,
                deadline: "Sep 11, 2026",
                attestedByA: false,
                attestedByB: true,
            },
        ],

        history: [
            {
                id: 3,
                title: "First video call",
                completedAt: "Sep 2, 2026",
                reputation: 10,
            },

            {
                id: 4,
                title: "Three-day activity streak",
                completedAt: "Sep 4, 2026",
                reputation: 10,
            },

            {
                id: 5,
                title: "Shared music challenge",
                completedAt: "Sep 6, 2026",
                reputation: 10,
            },

            {
                id: 6,
                title: "Mutual check-in streak",
                completedAt: "Sep 8, 2026",
                reputation: 10,
            },
        ],
    },
}

export default function PairDashboardPage() {
    const router = useRouter()

    const params = useParams<{
        id: string
    }>()

    const pair =
        pairData[
        params.id as keyof typeof pairData
        ] ?? pairData["alice-leo"]

   const [proposals, setProposals] = useState<Proposal[]>(
  pair.proposals
)

const [activeMilestones, setActiveMilestones] =
  useState<ActiveMilestone[]>(
    pair.activeMilestones
  )



    useEffect(() => {
        setProposals(pair.proposals)
        setActiveMilestones(pair.activeMilestones)
    }, [pair.id])

    const handleAcceptProposal = (proposalId: number) => {
        const proposal = proposals.find(
            (item) => item.id === proposalId
        )

        if (!proposal) return

        const acceptedProposal = {
            ...proposal,
            acceptedByA: true,
        }

        // Other Pair member already accepted
        if (acceptedProposal.acceptedByB) {
            setProposals((current) =>
                current.filter(
                    (item) => item.id !== proposalId
                )
            )

            setActiveMilestones((current) => [
                ...current,
                {
                    id: acceptedProposal.id,
                    title: acceptedProposal.title,
                    description: acceptedProposal.description,
                    reputation: acceptedProposal.reputation,
                    reward: acceptedProposal.reward,
                    deadline: acceptedProposal.deadline,

                    // Nobody has attested completion yet
                    attestedByA: false,
                    attestedByB: false,
                },
            ])

            return
        }

        // Alice accepted, but waiting on other Pair member
        setProposals((current) =>
            current.map((item) =>
                item.id === proposalId
                    ? acceptedProposal
                    : item
            )
        )
    }

    const handleRejectProposal = (proposalId: number) => {
        setProposals((current) =>
            current.filter(
                (item) => item.id !== proposalId
            )
        )
    }

    return (
        <main className="min-h-screen bg-background text-[#3D3B3A]">
            {/* HEADER */}
            <header className="border-b border-[#3D3B3A]/10 px-6">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
                    <button
                        onClick={() => router.push("/stud/discover")}
                        className="flex items-center gap-2 text-sm text-[#3D3B3A]/50 transition hover:text-[#3D3B3A]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Discover
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="text-xl font-semibold tracking-[-0.04em]"
                    >
                        STUD
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/45">
                        <HeartHandshake className="h-4 w-4" />
                        Your Pair
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* ======================
            PAIR HERO
        ======================= */}
                <div className="mb-12 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                    {/* LEFT */}
                    <div>
                        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#3D3B3A]/35">
                            Your shared identity
                        </p>

                        {/* Avatars */}
                        <div className="mb-7 flex items-center">
                            <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
                                <img
                                    src={pair.userA.image}
                                    alt={pair.userA.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="-ml-5 h-20 w-20 overflow-hidden rounded-full border-4 border-background">
                                <img
                                    src={pair.userB.image}
                                    alt={pair.userB.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E2A9F1]">
                                <HeartHandshake
                                    className="h-4 w-4"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="mb-3 flex items-center gap-2">
                            <h1 className="font-serif text-5xl leading-none md:text-6xl">
                                {pair.names}
                            </h1>

                            <BadgeCheck className="h-5 w-5" />
                        </div>

                        <p className="mb-6 text-lg text-[#3D3B3A]/40">
                            {pair.token}
                        </p>

                        <span className="inline-flex rounded-full border border-[#3D3B3A]/10 bg-[#E2A9F1]/25 px-4 py-2 text-xs">
                            {pair.stage}
                        </span>

                        <p className="mt-8 max-w-xl text-sm leading-relaxed text-[#3D3B3A]/50">
                            Complete milestones together, build your Pair reputation,
                            and progressively unlock larger economic permissions.
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="rounded-[2.5rem] border border-[#3D3B3A]/10 p-8">
                        <div className="mb-9 flex items-start justify-between">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#3D3B3A]/35">
                                    Pair reputation
                                </p>

                                <p className="text-6xl font-light">
                                    {pair.reputation}
                                    <span className="ml-2 text-xl text-[#3D3B3A]/25">
                                        / 100
                                    </span>
                                </p>
                            </div>

                            <Sparkles className="h-5 w-5 text-[#3D3B3A]/30" />
                        </div>

                        <div className="mb-9">
                            <div className="h-2 overflow-hidden rounded-full bg-[#3D3B3A]/10">
                                <div
                                    className="h-full rounded-full bg-[#3D3B3A]"
                                    style={{
                                        width: `${pair.reputation}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Metric
                                label="Market Capacity"
                                value={`$${pair.capacity.toLocaleString()}`}
                            />

                            <Metric
                                label="Reserve"
                                value={`$${pair.reserve.toLocaleString()}`}
                            />

                            <Metric
                                label="Completed"
                                value={String(pair.completedMilestones)}
                            />

                            <Metric
                                label="Pending Proposals"
                                value={String(proposals.length)}
                            />
                        </div>
                    </div>
                </div>

                {/* WORLD ID */}
                <div className="mb-14 flex flex-col justify-between gap-5 rounded-3xl border border-[#3D3B3A]/10 bg-[#E2A9F1]/15 p-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3D3B3A] text-[#E2A9F1]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-medium">
                                Verified Pair
                            </p>

                            <p className="mt-1 text-xs text-[#3D3B3A]/40">
                                Both people were World ID verified before this Pair formed.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3D3B3A]/40">
                        <Users className="h-4 w-4" />
                        2 verified humans
                    </div>
                </div>

                {/* ======================
            MILESTONE INBOX
        ======================= */}
                <section>
                    <div className="mb-7 flex items-end justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#3D3B3A]/35">
                                Milestone inbox
                            </p>

                            <h2 className="font-serif text-4xl">
                                Decide what you do together.
                            </h2>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3B3A]/45">
                                Investors and community members may propose milestones,
                                but nothing becomes active until both Pair members agree.
                            </p>
                        </div>

                        <span className="hidden text-xs text-[#3D3B3A]/35 sm:block">
                            {proposals.length} pending
                        </span>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        {proposals.map((proposal, index) => (
                           <MilestoneProposal
  key={proposal.id}
  proposal={proposal}
  index={index}
  otherUserName={pair.userB.name}
  onAccept={() =>
    handleAcceptProposal(proposal.id)
  }
  onReject={() =>
    handleRejectProposal(proposal.id)
  }
/>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

function Metric({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl bg-[#3D3B3A]/5 p-5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/30">
                {label}
            </p>

            <p className="text-xl font-medium">
                {value}
            </p>
        </div>
    )
}

function MilestoneProposal({
  proposal,
  index,
  otherUserName,
  onAccept,
  onReject,
}: {
  proposal: Proposal
  index: number
  otherUserName: string
  onAccept: () => void
  onReject: () => void
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                delay: index * 0.06,
            }}
            className="rounded-[2rem] border border-[#3D3B3A]/10 p-7"
        >
            <div className="mb-8 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E2A9F1]/40">
                    <Sparkles className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-[#3D3B3A]/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#3D3B3A]/40">
                    Proposed
                </span>
            </div>

            <p className="mb-2 text-xs text-[#3D3B3A]/35">
                Proposed by {proposal.proposer}
            </p>

            <h3 className="mb-3 text-xl font-medium">
                {proposal.title}
            </h3>

            <p className="min-h-[60px] text-sm leading-relaxed text-[#3D3B3A]/45">
                {proposal.description}
            </p>

            {/* DETAILS */}
            <div className="my-7 grid grid-cols-3 gap-3 border-y border-[#3D3B3A]/10 py-5">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Reputation
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        +{proposal.reputation}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Reward
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        {proposal.reward ?? "None"}
                    </p>
                </div>

                <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#3D3B3A]/30">
                        Deadline
                    </p>

                    <p className="mt-2 text-sm font-medium">
                        {proposal.deadline}
                    </p>
                </div>
            </div>

            <div className="mb-6 flex items-start gap-2 text-xs leading-relaxed text-[#3D3B3A]/35">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />

                <div className="mb-6 space-y-2">
  <AcceptanceStatus
    name="You"
    accepted={proposal.acceptedByA}
  />

  <AcceptanceStatus
    name={otherUserName}
    accepted={proposal.acceptedByB}
  />
</div>
            </div>

            {/* BUTTONS */}
           <div className="grid grid-cols-2 gap-3">
  <button
    onClick={onReject}
    className="rounded-full border border-[#3D3B3A]/10 py-3 text-sm text-[#3D3B3A]/55 transition hover:bg-[#3D3B3A]/5"
  >
    Reject
  </button>

  <button
    onClick={onAccept}
    disabled={proposal.acceptedByA}
    className="group flex items-center justify-between rounded-full bg-[#3D3B3A] py-2 pl-5 pr-2 text-sm font-medium text-[#E2A9F1] transition-opacity disabled:cursor-default disabled:opacity-50"
  >
    {proposal.acceptedByA
      ? `Waiting for ${otherUserName}`
      : "Accept"}

    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2A9F1] text-[#3D3B3A]">
      {proposal.acceptedByA ? (
        <Clock className="h-4 w-4" />
      ) : (
        <ArrowUpRight className="h-4 w-4" />
      )}
    </span>
  </button>
</div>
        </motion.div>
    )
}

function AcceptanceStatus({
  name,
  accepted,
}: {
  name: string
  accepted: boolean
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#3D3B3A]/45">
        {name}
      </span>

      <span
        className={
          accepted
            ? "font-medium text-[#3D3B3A]"
            : "text-[#3D3B3A]/30"
        }
      >
        {accepted ? "✓ Accepted" : "Waiting"}
      </span>
    </div>
  )
}