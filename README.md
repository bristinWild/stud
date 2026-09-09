# Stud

> **Stud is a World ID–verified social + market protocol where verified humans can match, form a new shared onchain Pair identity, build Pair reputation through consent-based milestones, and unlock progressively larger markets.**

---

## 1. Product Thesis

Stud combines three layers:

1. **Verified social identity** - users prove unique humanity with World ID.
2. **Social matching** - verified users discover each other and mutually match.
3. **Market infrastructure** - objective social outcomes can be traded before a match, while a successful match creates a persistent Pair Token market.

The defining primitive is the **Pair**:

```text
Verified Human A
+
Verified Human B
+
Mutual Match
=
New Pair Identity
```

The Pair is a third onchain identity with its own:

- Pair ID
- Pair Token
- reputation
- milestone history
- market stage
- market capacity
- liquidity lifecycle

The core rule is:

> **Social activity changes reputation. Market demand changes price.**

Reputation never directly pumps or sets the Pair Token price.

---

## 2. Participants

### 2.1 Stud

A **Stud** is a World ID–verified human using the social side of the app.

A Stud can:

- verify with World ID
- create a profile
- discover other verified users
- like / swipe
- form mutual matches
- create Pair identities
- accept or reject milestone proposals
- attest completed milestones
- accumulate individual protocol history

### 2.2 Pair

A **Pair** is created after two verified Studs mutually match.

Example:

```text
Alice + Bob
    ↓
AliceBob Pair

Pair ID: 0xPAIR...
Pair Token: $ALICEBOB
Pair Reputation: 0
Completed Milestones: 0
Stage: New
Market Capacity: $500
Market Venue: Stud Bonding Curve
```

The Pair starts from zero reputation and develops independently from Alice and Bob.

### 2.3 Investor / Backer

Investors can participate in two distinct market types:

1. **Individual outcome markets** before or around matching.
2. **Pair Token markets** after a Pair is created.

These are deliberately separate products.

---

# 3. The Two Investment Paths

## 3.1 Investing Around an Individual Stud

The original Stud concept says investors may “back individual Studs,” but it does **not** define a persistent individual Stud token or an ownership claim over a person.

For the MVP, the cleanest implementation is:

> **Individual backing = prediction markets on objective protocol events.**

Examples:

```text
Will Alice receive at least 1 verified mutual match by Friday?

Will Bob reach 5 verified mutual matches this month?

Will Alice and Bob form a Pair before September 30?
```

These markets should settle only on objective protocol state.

Avoid markets such as:

```text
Will Alice fall in love?
Is Bob a good partner?
Will their date be romantic?
```

Stud should never attempt to resolve subjective emotions.

### Individual Market MVP Mechanics

Recommended MVP format:

```text
Market:
Will Alice receive ≥1 verified mutual match by Sep 30?

Outcomes:
YES / NO

Collateral:
USDC

Share value at resolution:
1 winning share = 1 USDC
1 losing share = 0 USDC
```

A YES or NO share trades between `0` and `1 USDC`.

#### Example Investor Gain

An investor buys:

```text
100 YES shares
Average entry price: $0.35
Cost: 100 × $0.35 = $35
```

If the market resolves YES:

```text
Payout: 100 × $1 = $100
Gross profit: $100 - $35 = $65
```

If it resolves NO:

```text
Payout: $0
Loss: $35
```

This is the most precise current interpretation of “backing an individual Stud.”

### Important

For the ETHGlobal MVP:

- no individual Stud token is required
- no investor owns part of a person
- no revenue share from a Stud is implied
- the investor is taking a position on an objective protocol event

---

# 4. Investing in a Pair

Once two Studs mutually match, Stud creates a Pair Token.

Example:

```text
Alice + Bob
→ Pair created
→ $ALICEBOB launched
```

Investors can buy and sell `$ALICEBOB` through the Stud bonding-curve market.

Unlike an individual prediction market, a Pair Token does **not** resolve on one date.

It is a persistent market around the Pair identity.

---

## 4.1 Why an Investor Buys a Pair Token

An investor may believe:

```text
Pair stays active
    ↓
Pair completes more milestones
    ↓
Pair reputation increases
    ↓
More market permissions unlock
    ↓
More market participants may become interested
    ↓
Demand for the Pair Token may increase
    ↓
Token price may rise
```

This is speculative.

There is no guaranteed return.

---

## 4.2 How a Pair Token Investor Makes or Loses Money

A Pair Token investor makes money only if they can later sell their tokens for more than their effective purchase cost.

Example:

```text
Investor buys:
200 $ALICEBOB

Average buy price:
$0.40

Total cost:
200 × $0.40 = $80
```

Later, stronger demand moves the market.

If the investor can sell at an average execution price of `$0.65`:

```text
Sale proceeds:
200 × $0.65 = $130

Gross gain:
$130 - $80 = $50
```

If demand falls and the average sell price becomes `$0.25`:

```text
Sale proceeds:
200 × $0.25 = $50

Gross loss:
$80 - $50 = $30
```

Actual execution should account for:

- bonding-curve slippage
- protocol fees, if any
- available liquidity

### Critical Rule

A milestone does **not** directly pay Pair Token holders.

A milestone does:

```text
Milestone completed
→ Pair reputation increases
→ higher protocol permissions may unlock
```

Then investors independently decide whether that makes the Pair more or less attractive.

---

# 5. Pair Reputation - MVP

For the hackathon version, reputation should be transparent.

### Final MVP Rule

```text
Pair created:
Reputation = 0

Milestone accepted:
+0

Milestone successfully completed
AND mutually attested:
+10
```

No hidden scoring model is needed for the MVP.

Examples:

```text
0 completed milestones  → Reputation 0
1 completed milestone   → Reputation 10
2 completed milestones  → Reputation 20
5 completed milestones  → Reputation 50
7 completed milestones  → Reputation 70
```

Future versions can add richer signals such as:

- pair age
- completion rate
- mutual attestation rate
- activity consistency
- challenge diversity
- community sponsorship
- cooldowns / anti-farming signals

---

# 6. Consent-Based Milestones

A milestone is a voluntary joint action proposed to a Pair.

Examples:

```text
Complete a first video call before Sunday

Complete three mutual check-ins this week

Attend a shared event

Complete a sponsored coffee challenge
```

A milestone becomes active only when:

```text
Alice accepts
AND
Bob accepts
```

An investor or community member:

```text
can propose
cannot force
```

If either Pair member rejects:

```text
Proposal rejected
→ no reputation change
→ no penalty
```

---

# 7. Milestone Completion

After an accepted milestone is completed:

```text
Alice attests
Bob attests
```

The protocol checks:

```text
Alice attested?       ✓
Bob attested?         ✓
Deadline valid?       ✓
Pair still active?    ✓
Milestone accepted?   ✓
```

Then:

```text
Milestone status:
Completed

Pair Reputation:
+10
```

For the hackathon MVP, mutual attestation is sufficient.

Stud does not need invasive surveillance of real-world activity.

---

# 8. Market Capacity

Market capacity limits how much capital can enter a new Pair market before the Pair has built sufficient reputation.

For the MVP, define **market capacity** as:

> **The maximum USDC reserve / economic exposure permitted inside the controlled Pair bonding-curve market at the Pair's current reputation stage.**

This prevents a brand-new Pair from immediately attracting unlimited capital.

---

# 9. Final MVP Pair Stages

To remove ambiguity from earlier drafts, use these thresholds consistently:

| Pair Stage | Reputation | Maximum Controlled Market Capacity | Market Status |
|---|---:|---:|---|
| New | 0–19 | $500 | Stud bonding curve |
| Growing | 20–49 | $2,000 | Stud bonding curve |
| Established | 50–69 | $10,000 | Stud bonding curve |
| Graduation Eligible | 70+ and reserve ≥ $10,000 | Graduation enabled | Ready for open liquidity |
| Graduated | After liquidity migration | Open | DEX / open liquidity |

This gives the protocol a simple rule:

```text
Proof first
Capital later
```

Example:

```text
Pair Reputation = 10
→ Market Capacity = $500

Pair Reputation = 20
→ Market Capacity = $2,000

Pair Reputation = 50
→ Market Capacity = $10,000

Pair Reputation ≥ 70
AND
Bonding Curve Reserve ≥ $10,000
→ Graduation Eligible
```

---

# 10. Bonding-Curve Market

Before graduation, Pair Tokens trade inside Stud through a bonding curve.

Conceptually:

```text
More net buying
→ token price rises along the curve

More net selling
→ token price falls along the curve
```

The bonding curve provides:

- controlled early liquidity
- deterministic price quotes
- market-capacity enforcement
- transparent buy / sell execution
- a reserve that can be used in graduation logic

The exact curve formula can be implementation-specific for the hackathon.

The UI and contract should expose at minimum:

```text
current token price
current token supply
current reserve
current stage capacity
remaining capacity
estimated buy / sell execution price
```

---

# 11. Reputation Does Not Set Price

This distinction is central to Stud.

Wrong:

```text
Pair completes milestone
→ contract increases price by 20%
```

Stud:

```text
Pair completes milestone
        ↓
Reputation +10
        ↓
New economic permissions may unlock
        ↓
Investors observe the new state
        ↓
Investors buy or sell
        ↓
Demand changes
        ↓
Bonding curve price changes
```

> **The protocol changes reputation. The market changes price.**

---

# 12. Graduation

A Pair can graduate from the controlled Stud bonding curve into open liquidity.

### Final MVP Graduation Rule

```text
Pair Reputation ≥ 70
AND
Bonding Curve Reserve ≥ $10,000
```

Then:

```text
Pair Stage
→ Graduation Eligible
```

For the ETHGlobal demo, full production DEX migration is optional.

A testnet migration or clearly demonstrated graduation state is sufficient.

---

# 13. Sponsored Milestones

Sponsors can attach rewards to milestones.

Example:

```text
Sponsor:
Coffee Brand

Milestone:
Complete a verified coffee-date challenge

Reward:
20 USDC
```

Flow:

```text
Sponsor funds reward
        ↓
Pair sees challenge
        ↓
Alice + Bob accept
        ↓
Pair completes challenge
        ↓
Both attest
        ↓
Pair Reputation +10
        +
20 USDC reward released
```

### Who receives the sponsored reward?

For the current product model:

> **The reward belongs to the Pair / Pair participants, not automatically to Pair Token investors.**

Token holders do not receive a claim on milestone rewards unless Stud explicitly introduces a separate revenue-sharing mechanism in the future.

That mechanism is **not part of the current MVP**.

---

# 14. Prediction Markets vs Pair Tokens

Stud contains two different market primitives.

| Feature | Individual / Outcome Market | Pair Token Market |
|---|---|---|
| What is traded? | YES / NO outcome shares | Pair Token |
| Example | “Will Alice get a verified match this week?” | `$ALICEBOB` |
| Lifetime | Ends at resolution | Persistent |
| Settlement | Objective protocol event | No single settlement date |
| Investor gain | Correct outcome share redeems for more than entry cost | Sell token later at a higher market price |
| Main risk | Prediction is wrong | Pair Token demand falls |
| Reputation directly sets price? | No | No |

---

# 15. World ID

World ID gives Stud Sybil-resistant proof that participants are unique humans.

A valid Stud requires:

```text
Wallet
+
World ID proof
=
Verified Stud
```

A valid Pair requires:

```text
Verified Human A
+
Verified Human B
+
Mutual Match
=
Valid Pair
```

World ID helps reduce:

- duplicate identities
- bot profiles
- mass account farming
- fake Pair creation
- Sybil-based reputation farming

World ID does not prove that a relationship is emotionally successful.

---

# 16. Privacy

Dating and social information can be sensitive.

Keep onchain:

```text
World ID verification state / nullifier use
Pair existence
Pair reputation
milestone commitment / hash
milestone status
attestation state
Pair market state
graduation state
```

Keep private / offchain where possible:

```text
private messages
exact locations
personal photos
sensitive milestone details
real names unless explicitly chosen
```

---

# 17. Market Integrity

Potential attacks include:

- self-matching
- multiple-account farming
- fake milestone farming
- wash trading
- coordinated token manipulation
- spam milestone proposals

MVP defenses:

- World ID uniqueness
- Pair market-capacity limits
- only mutual matches can create Pairs
- milestone requires two-sided acceptance
- completion requires two-sided attestation
- objective protocol-event prediction markets

Future defenses can add:

- reputation cooldowns
- milestone frequency limits
- minimum Pair age
- anti-wash-trading logic
- challenge diversity requirements
- richer attestation sources

---

# 18. Hackathon MVP

The ETHGlobal MVP should implement the smallest complete loop.

### Social

```text
Connect wallet
→ World ID verify
→ create Stud
→ discover profiles
→ mutual match
```

### Pair

```text
Mutual match
→ Pair ID
→ Pair Token
→ Reputation = 0
→ Stage = New
→ Capacity = $500
```

### Milestone

```text
Investor / community proposes milestone
→ Alice accepts
→ Bob accepts
→ milestone active
→ both attest
→ completed
→ Reputation +10
```

### Market

```text
Investor buys Pair Token
→ bonding curve quote changes with demand
→ capacity enforced by reputation stage
```

### Graduation

```text
Reputation ≥ 70
+
Reserve ≥ $10,000
→ Graduation Eligible
```

### Optional Individual Market

```text
Will Alice receive ≥1 verified mutual match by deadline?
YES / NO shares
→ resolve from protocol state
```

---

# 19. Suggested Contract Architecture

```text
StudRegistry
│
├── WorldIDVerifier
├── StudProfile
├── MatchRegistry
│
├── PairFactory
│   └── Pair
│       ├── PairToken
│       ├── PairState
│       └── PairReputation
│
├── MilestoneManager
├── AttestationManager
├── BondingCurveMarket
├── GraduationManager
│
└── OutcomeMarket        [optional MVP module]
```

---

# 20. Core Data Model

## Stud

```solidity
struct Stud {
    address owner;
    bytes32 worldIdNullifier;
    bool verified;
}
```

## Pair

```solidity
struct Pair {
    uint256 pairId;
    address userA;
    address userB;
    address pairToken;
    uint256 reputation;
    uint256 completedMilestones;
    uint256 createdAt;
    PairStage stage;
}
```

## PairStage

```solidity
enum PairStage {
    New,
    Growing,
    Established,
    GraduationEligible,
    Graduated,
    Retired
}
```

## Milestone

```solidity
struct Milestone {
    uint256 milestoneId;
    uint256 pairId;
    bytes32 contentHash;
    address proposer;
    bool acceptedByA;
    bool acceptedByB;
    bool attestedByA;
    bool attestedByB;
    uint256 deadline;
    MilestoneStatus status;
}
```

## Optional Individual Outcome Market

```solidity
struct OutcomeMarket {
    uint256 marketId;
    uint256 studId;
    bytes32 conditionHash;
    uint256 deadline;
    bool resolved;
    bool outcome;
}
```

---

# 21. Complete Investor Journey

## A. Investor backs an individual outcome

```text
Alice is World ID verified

Market:
"Will Alice receive ≥1 verified mutual match by Sep 30?"

Investor buys:
100 YES shares at $0.35

Cost:
$35
```

If Alice receives a qualifying match before the deadline:

```text
YES resolves at $1

Investor receives:
$100

Gross profit:
$65
```

If she does not:

```text
YES resolves at $0

Investor loses:
$35
```

---

## B. Investor backs a Pair

Alice and Bob match:

```text
Pair:
AliceBob

Token:
$ALICEBOB

Reputation:
0

Capacity:
$500
```

Investor buys:

```text
200 tokens
Average price = $0.40
Cost = $80
```

The Pair completes two milestones:

```text
Reputation:
0 → 10 → 20

Market capacity:
$500 → $2,000
```

Other market participants decide the stronger Pair state is attractive and buy.

If the investor later sells:

```text
200 tokens
Average sell price = $0.65
Proceeds = $130

Gross gain = $50
```

The gain came from market demand and resale price - not from the protocol directly increasing the token price.

---

# 22. FAQ

### What is Stud?

Stud is a World ID–verified social + market protocol. Verified humans discover each other and match; a mutual match can create a new shared Pair identity with its own reputation, token, milestones, and market lifecycle.

### Can investors back an individual Stud?

Yes, but the current MVP should do this through **objective prediction markets**, not through an individual human token. Example: “Will Alice receive a verified mutual match by September 30?”

### How does an investor make money from an individual Stud market?

The investor buys YES or NO outcome shares. A winning share redeems for `1 USDC`; a losing share redeems for `0`. Profit depends on the investor's entry price and whether the objective event occurs.

### Does an investor own part of a Stud?

No. Stud does not represent ownership, equity, or control over a person.

### How do investors invest in a Pair?

After two verified users mutually match, Stud creates a Pair Token such as `$ALICEBOB`. Investors can buy and sell the Pair Token through the controlled bonding-curve market.

### How does a Pair Token investor make money?

A Pair Token investor can make money if they later sell at a higher effective market price than they paid. They can lose money if demand falls and they sell lower.

### Does completing a milestone automatically increase Pair Token price?

No. Completing a mutually accepted milestone increases Pair reputation by `+10` in the MVP. Investors then decide whether to buy or sell. Only market demand changes the token price.

### What does reputation unlock?

For the MVP:

```text
Reputation 0–19  → $500 market capacity
Reputation 20–49 → $2,000 market capacity
Reputation 50–69 → $10,000 market capacity
Reputation 70+   → graduation can become eligible
```

### What is market capacity?

It is the maximum USDC reserve / economic exposure allowed inside the Pair's controlled bonding-curve market at its current stage.

### Can investors force a Pair to complete challenges?

No. Investors can propose milestones, but both Pair members must accept before a milestone becomes active.

### Who receives a sponsored milestone reward?

The Pair / Pair participants receive the reward after successful completion and mutual attestation. Pair Token holders do not automatically receive milestone rewards.

### What triggers graduation?

For the MVP:

```text
Pair Reputation ≥ 70
AND
Bonding Curve Reserve ≥ $10,000
```

The Pair then becomes `Graduation Eligible`.

### What happens after graduation?

The Pair Token can move from the controlled Stud market toward open DEX liquidity. A production-grade DEX migration is not required for the hackathon demo.

### Why use World ID?

World ID helps ensure each Stud is a unique human and reduces bots, duplicate accounts, fake Pair creation, and Sybil-based reputation farming.

### Does Stud verify whether two people actually love each other?

No. Stud only uses objective protocol state and mutual attestations. It does not attempt to judge emotions.

---

# 23. What Stud Is Not

Stud is not:

- ownership of people
- an investor-controlled dating protocol
- a protocol that judges love
- a mechanism that automatically pumps token prices after dates
- a surveillance system
- a guaranteed investment-return product
- a generic yield vault

---

# 24. Demo Story

```text
1. Alice verifies with World ID.

2. Bob verifies with World ID.

3. Alice and Bob mutually match.

4. Stud creates:
   AliceBob Pair
   $ALICEBOB
   Reputation = 0
   Capacity = $500

5. Investor proposes:
   "Complete your first video call this week."

6. Alice accepts.
   Bob accepts.

7. Both later attest completion.

8. Reputation:
   0 → 10

9. Another completed milestone:

   Reputation:
   10 → 20

   Market Capacity:
   $500 → $2,000

10. Investors buy / sell $ALICEBOB.
    Bonding curve price moves from demand.

11. Future-state demo:

    Reputation ≥ 70
    Reserve ≥ $10,000

    → GRADUATION ELIGIBLE
```

---

# 25. Product Principles

### Humans First

World ID ensures Stud begins with unique humans.

### Consent First

Investors can propose. Pairs decide.

### Objective Markets

Individual prediction markets resolve on verifiable protocol events.

### Reputation Before Capital

New Pairs have deliberately limited market exposure.

### Reputation ≠ Price

Reputation changes permissions. Demand changes price.

### Relationships as Infrastructure

The Pair is a programmable onchain identity, not only a dating-app database row.

---

# 26. One-Sentence Pitch

> **Stud is a World ID–verified social + market protocol where investors can trade objective outcomes around individual verified users, while a mutual match creates a new Pair identity whose consent-based reputation progressively unlocks larger token markets and liquidity.**

---

# 27. Short Pitch

Stud begins as a social app for World ID–verified humans.

Before a match, market participants can take positions on objective events such as whether a verified Stud will receive a mutual match by a deadline.

When two people mutually match, Stud creates a new shared onchain identity: the **Pair**.

The Pair receives a token, starts at zero reputation, and initially has only `$500` of controlled market capacity.

Investors and community members can propose milestones, but both members must accept them. Every successfully completed and mutually attested milestone adds `+10` Pair reputation.

At `20` reputation, market capacity increases to `$2,000`. At `50`, it increases to `$10,000`. Once reputation reaches at least `70` and the bonding-curve reserve reaches `$10,000`, the Pair becomes eligible to graduate toward open liquidity.

Pair reputation never directly changes token price. Investors make or lose money based on the price at which they buy and later sell as market demand changes.

> **Two humans match. A third identity is born. Reputation controls permission; markets control price.**
