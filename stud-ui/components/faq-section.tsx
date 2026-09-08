import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Stud?",
    answer:
      "Stud is a World ID–verified social + market protocol. Verified humans can discover and match with each other, and a mutual match creates a new shared onchain identity called a Pair, with its own token, reputation, milestones, and market lifecycle.",
  },
  {
    question: "Why does Stud use World ID?",
    answer:
      "World ID helps Stud verify that each participant is a unique human. This reduces bots, duplicate accounts, fake Pair creation, and Sybil-based reputation farming without requiring users to reveal sensitive personal information onchain.",
  },
  {
    question: "Can investors invest in an individual Stud?",
    answer:
      "Yes. In the current MVP, individual backing happens through objective prediction markets rather than by tokenizing a person. For example, investors can trade on whether Alice will receive a verified mutual match before a specific deadline.",
  },
  {
    question: "How does an investor make money from an individual Stud market?",
    answer:
      "Investors buy YES or NO outcome shares. A winning share resolves to 1 USDC and a losing share resolves to 0. For example, buying 100 YES shares at $0.35 costs $35. If the market resolves YES, the payout is $100, producing a $65 gross profit.",
  },
  {
    question: "Does an investor own part of a Stud?",
    answer:
      "No. Stud does not give investors ownership, equity, or control over a person. Individual markets only represent positions on objective protocol events.",
  },
  {
    question: "What happens when two people match?",
    answer:
      "When two World ID–verified users mutually match, Stud creates a new shared onchain identity called a Pair. The Pair receives its own Pair ID, Pair Token, reputation score, milestone history, market stage, and market capacity.",
  },
  {
    question: "How do investors invest in a Pair?",
    answer:
      "Once a Pair is created, investors can buy and sell its Pair Token through Stud's controlled bonding-curve market. For example, Alice and Bob may create the Pair Token $ALICEBOB.",
  },
  {
    question: "How does a Pair Token investor make money?",
    answer:
      "An investor profits if they later sell the Pair Token at a higher effective price than they paid. For example, buying 200 tokens at an average price of $0.40 costs $80. Selling those 200 tokens later at an average price of $0.65 returns $130, creating a $50 gross gain before fees or slippage.",
  },
  {
    question: "Does completing a milestone automatically increase Pair Token price?",
    answer:
      "No. This is a core rule of Stud. Completing a milestone increases Pair reputation, but token price changes only because investors buy or sell. Reputation changes protocol permissions; market demand changes price.",
  },
  {
    question: "How does Pair reputation grow?",
    answer:
      "For the MVP, Pair reputation starts at 0. Every successfully completed milestone that both Pair members mutually attest adds +10 reputation. Simply accepting a milestone does not increase reputation.",
  },
  {
    question: "Who can propose milestones?",
    answer:
      "Investors, community members, or sponsors can propose milestones, but both members of the Pair must explicitly accept before the milestone becomes active.",
  },
  {
    question: "Can investors force a Pair to complete a challenge?",
    answer:
      "No. Investors can only propose. If either Pair member rejects the milestone, nothing happens and there is no penalty.",
  },
  {
    question: "What does reputation unlock?",
    answer:
      "Reputation progressively unlocks larger economic permissions. In the MVP, reputation 0–19 allows up to $500 of market capacity, 20–49 allows up to $2,000, and 50–69 allows up to $10,000. At 70+ reputation, a Pair can become eligible for graduation if the liquidity threshold is also reached.",
  },
  {
    question: "What is market capacity?",
    answer:
      "Market capacity is the maximum USDC reserve or economic exposure allowed inside a Pair's controlled bonding-curve market at its current reputation stage. It prevents a brand-new Pair from immediately attracting unlimited capital.",
  },
  {
    question: "What is the bonding curve?",
    answer:
      "Before graduation, Pair Tokens trade inside Stud through a bonding curve. More net buying pushes the token price upward along the curve, while more net selling pushes it downward. This gives Stud controlled early liquidity and transparent price discovery.",
  },
  {
    question: "What does graduation mean?",
    answer:
      "Graduation means a Pair becomes eligible to move from Stud's controlled bonding-curve market toward open liquidity. For the MVP, graduation requires Pair Reputation of at least 70 and a bonding-curve reserve of at least $10,000.",
  },
  {
    question: "Who receives rewards from sponsored milestones?",
    answer:
      "Sponsored milestone rewards belong to the Pair or the Pair participants after successful completion and mutual attestation. Pair Token holders do not automatically receive milestone rewards.",
  },
  {
    question: "Does Stud guarantee investor returns?",
    answer:
      "No. Individual prediction markets can resolve against an investor, and Pair Token prices can fall. Stud provides verified social state, reputation, and market infrastructure, but all market participation remains speculative.",
  },
]

export function FAQSection() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden px-6 py-32 pb-64"
    >
      {/* Background word */}
      <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 select-none">
        <span className="whitespace-nowrap text-[18vw] font-bold leading-none tracking-[-0.07em] text-[rgba(61,59,58,0.03)]">
          FAQ
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stud-ink/50">
            Questions, answered
          </p>

          <h2 className="mb-6 text-balance font-serif text-4xl font-normal text-stud-ink md:text-5xl lg:text-6xl">
            Understand Stud in minutes.
          </h2>

          <p className="mx-auto max-w-2xl leading-relaxed text-stud-ink/60">
            How verified humans, Pair identities, reputation, prediction
            markets, and Pair Tokens work together.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="overflow-hidden rounded-2xl border border-stud-ink/10 bg-stud-light/30 px-6 transition-all duration-300 data-[state=open]:border-stud-ink/20 data-[state=open]:bg-stud-light/60"
            >
              <AccordionTrigger className="py-6 text-left text-base font-medium text-stud-ink hover:no-underline md:text-lg">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="max-w-3xl pb-6 text-sm leading-relaxed text-stud-ink/60 md:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}