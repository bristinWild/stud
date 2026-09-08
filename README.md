# Stud

> **A World ID–verified social + DeFi protocol where two people can match, create a shared onchain identity, build reputation through consent-based milestones, and progressively unlock deeper market participation.**

---

## 1. Overview

**Stud** is a social application with an onchain market layer.

At the social layer, users discover and match with real people, similar to a dating app. Each user is verified through **World ID** so the protocol can reason about unique humans rather than bots or duplicate accounts.

At the market layer, users can be backed by participants who believe they will form successful verified social connections.

The core primitive appears **after two verified users mutually match**:

> **Two individual identities create a third shared onchain identity: the Pair.**

When Alice and Bob match, Stud creates a **Pair Token / Pair Identity** representing that connection.

The Pair begins with very limited economic permissions. Over time, Alice and Bob may voluntarily accept community- or investor-proposed milestones. When both complete and attest to a milestone, the Pair earns reputation.

That reputation does **not automatically increase token price**.

Instead, reputation expands what the Pair is allowed to do economically:

- larger token-market limits,
- access to sponsored challenges and rewards,
- deeper liquidity,
- higher market capacity,
- and eventually graduation into an open liquidity pool.

The market decides price.  
The protocol decides what reputation unlocks.

---

# 2. The Core Idea in One Flow

```text
World ID Verification
        ↓
Verified Social Profile
        ↓
Swipe / Discover
        ↓
Mutual Match
        ↓
Pair Identity + Pair Token Created
        ↓
Community / Investors Propose Milestones
        ↓
Alice + Bob Choose What They Accept
        ↓
They Complete a Joint Activity
        ↓
Both Submit an Attestation
        ↓
Pair Reputation Increases
        ↓
New Economic Permissions Unlock
        ↓
More Market Capacity / Rewards / Liquidity
        ↓
If Reputation + Market Demand Reach Threshold
        ↓
Pair Token Graduates to an Open Liquidity Pool
```

---

# 3. Why Stud Exists

Most dating and social applications have two major properties:

1. social interactions are kept inside a closed application database;
2. those interactions have almost no composable economic identity.

At the same time, crypto markets can create economic systems around almost anything, but they often struggle with one major problem:

**How do we know the participants are real humans?**

Stud connects these two worlds.

It asks:

> What happens when a verified social connection itself becomes an evolving onchain primitive?

Instead of only representing Alice and Bob individually, Stud lets their connection become something that has:

- identity,
- history,
- reputation,
- permissions,
- community participation,
- and eventually its own market.

---

# 4. Main Participants

## 4.1 Studs

A **Stud** is a verified human using the social side of the platform.

A Stud can:

- verify with World ID,
- create a social profile,
- discover other verified users,
- swipe / express interest,
- receive matches,
- create Pair Identities,
- accept or reject proposed milestones,
- complete joint milestones,
- build individual and Pair reputation.

---

## 4.2 Investors / Backers

Investors participate in the market layer.

They may:

- back individual Studs,
- participate in early Pair Token markets,
- observe reputation and milestone history,
- propose optional Pair challenges,
- participate as Pair markets expand,
- trade Pair Tokens according to their own view of the Pair's future demand.

Importantly:

> Investors do not control Alice or Bob.

They can propose a milestone, but the Pair must explicitly accept it.

---

## 4.3 The Pair

When two verified users mutually match, Stud creates a new entity:

```text
Alice + Bob → AliceBob Pair
```

The Pair is not simply Alice's reputation plus Bob's reputation.

It is a **new shared identity** that develops its own history.

For example:

```text
Alice
World ID verified
Individual reputation: 72

Bob
World ID verified
Individual reputation: 81

             ↓ Match

AliceBob Pair
Pair ID: 0xPAIR...
Stage: New
Pair Reputation: 0
Completed Milestones: 0
Market Capacity: Small
Liquidity Stage: Bonding Curve
```

The Pair then grows independently.

---

# 5. World ID

World ID is one of the most important parts of Stud.

It gives Stud a way to build markets around **real, unique humans** rather than arbitrary wallets.

Possible uses include:

### Human Verification

A user must prove they are a unique human before becoming a Stud.

```text
Wallet
  +
World ID Proof
  ↓
Verified Stud
```

### Sybil Resistance

Without proof-of-humanity, someone could create hundreds of wallets and:

- fake matches,
- farm reputation,
- manipulate Pair Tokens,
- create fake milestone attestations,
- distort markets.

World ID greatly reduces this problem.

### Pair Formation

A valid Pair can require:

```text
Verified Human A
+
Verified Human B
+
Mutual Match
=
Valid Pair
```

World ID proves uniqueness.

It does **not** need to reveal sensitive personal identity information onchain.

---

# 6. Social Layer

Stud begins like a familiar social application.

Users can:

```text
Create profile
    ↓
Discover people
    ↓
Swipe / Like
    ↓
Mutual interest
    ↓
Match
```

The important difference is what happens after the match.

Traditional dating app:

```text
Match → Chat
```

Stud:

```text
Match
  ↓
Chat / Social Interaction
  +
Create Pair Identity
  +
Create Pair Token
  +
Start Pair Reputation
```

---

# 7. Pair Token

The **Pair Token** is the market-facing representation of the Pair.

Example:

```text
Alice + Bob match

→ Pair ID created
→ $ALICEBOB launched
```

The Pair Token should not simply be a meme token with no connection to the underlying relationship.

It is connected to:

- Pair identity,
- Pair reputation,
- accepted milestones,
- completed milestones,
- market stage,
- market capacity,
- liquidity status.

---

# 8. Pair Reputation

Pair reputation is the core state variable of the social-financial bridge.

It measures **verified progress**, not popularity alone.

Example:

```text
Pair Reputation

0       New Pair
10      First accepted milestone
20      First completed joint action
35      Multiple successful milestones
50      Consistent activity
70      Established Pair
90+     Highly established Pair
```

The actual score does not need to be magical.

For the MVP, it can be extremely simple.

Example:

```text
+10 reputation per successfully completed milestone
```

Later it could become multidimensional.

Possible signals:

```text
pair_age
accepted_milestones
completed_milestones
completion_rate
mutual_attestation_rate
activity_consistency
challenge_diversity
community_sponsorship
```

---

# 9. Reputation Does NOT Directly Set Price

This distinction is extremely important.

Bad design:

```text
Pair completes date
→ Smart contract increases token price 20%
```

That creates an artificial market.

Stud instead uses:

```text
Pair completes milestone
        ↓
Reputation increases
        ↓
Market sees stronger Pair history
        ↓
Investors decide whether to buy/sell
        ↓
Demand changes
        ↓
Price changes naturally
```

Therefore:

> **Activities change reputation. Markets change price.**

---

# 10. Milestones / Joint Actions

A milestone is a voluntary action that Alice and Bob agree to complete together.

Examples could include:

```text
Have a first video call
Complete a mutual check-in
Attend an event together
Complete a shared game/challenge
Do three mutual check-ins this week
Maintain activity for seven days
Complete a sponsored social challenge
```

Stud should avoid trying to judge subjective questions such as:

```text
"Was the date romantic?"
"Does Alice truly love Bob?"
"Was Bob a good partner?"
```

Instead, Stud should verify simple facts:

```text
Did both participants claim the milestone happened?
Did they attest before the deadline?
Were both accounts World ID verified?
```

---

# 11. Who Creates Milestones?

One of the most interesting parts of Stud is that milestones can be **community-driven**.

An investor might propose:

> "Have your first video call before Sunday."

Another might propose:

> "Complete three shared check-ins this week."

But Alice and Bob have complete control.

Flow:

```text
Investor proposes milestone
        ↓
Pair receives proposal
        ↓
Alice reviews
Bob reviews
        ↓
Both accept
        ↓
Milestone becomes active
```

If either person rejects it:

```text
Proposal rejected
→ Nothing happens
```

This keeps investor participation interesting without allowing investors to control the people they back.

---

# 12. Milestone Attestation

Suppose Alice and Bob accept:

```text
Milestone:
"Complete a video call before Sunday"
```

After completing it:

```text
Alice → Attest
Bob   → Attest
```

The contract checks:

```text
Alice attested? ✓
Bob attested?   ✓
Deadline valid? ✓
Pair active?    ✓
```

Then:

```text
Milestone → Completed

Pair Reputation:
20 → 30
```

For the hackathon MVP, mutual attestation is enough.

Stud does not need to build invasive real-world surveillance.

---

# 13. Economic Permissions

Reputation becomes valuable because it unlocks **economic permissions**.

This is the central DeFi mechanism.

Think of reputation like a key.

```text
More verified Pair history
        ↓
More protocol permissions
```

Possible unlocks:

### Stage 1 - New Pair

```text
Reputation: 0–20
Market Capacity: $500
Trading: Stud bonding curve only
Sponsored Challenges: Limited
```

### Stage 2 - Growing Pair

```text
Reputation: 20–50
Market Capacity: $2,000
More challenges available
Larger community participation
```

### Stage 3 - Established Pair

```text
Reputation: 50–80
Market Capacity: $10,000
Premium sponsored challenges
Graduation eligibility
```

### Stage 4 - Graduated Pair

```text
Reputation: 80+
Strong market demand
Liquidity threshold reached

→ Token graduates to DEX liquidity
```

These numbers are examples, not finalized economics.

---

# 14. What Is a Market Capacity Limit?

A market capacity limit controls how much economic exposure a very new Pair can have.

For example:

```text
New Pair

Maximum token-market capacity:
$500
```

Even if people want to put $100,000 into the token immediately, the protocol does not allow it.

Why?

Because Alice and Bob have almost no Pair history yet.

As they build reputation:

```text
Reputation 0
→ $500 capacity

Reputation 30
→ $2,000 capacity

Reputation 60
→ $10,000 capacity
```

This creates:

```text
Proof first
Capital later
```

rather than:

```text
Hype first
Unlimited capital immediately
```

---

# 15. Bonding Curve

Before graduation, the Pair Token can trade through a simple **bonding curve** inside Stud.

Conceptually:

```text
More token bought
→ Token price gradually increases

Token sold
→ Token price decreases
```

This creates an early-stage controlled market.

The Pair Token is not immediately thrown into an unrestricted DEX pool.

The bonding curve lets Stud manage:

- early liquidity,
- price discovery,
- market limits,
- graduation thresholds.

---

# 16. Graduation

A Pair Token can eventually graduate.

Think of it like:

```text
Small internal market
        ↓
Pair proves itself
        ↓
Market demand grows
        ↓
Threshold reached
        ↓
Graduation
        ↓
Open liquidity pool
```

Graduation should ideally require **both**:

```text
Social Proof
+
Market Proof
```

For example:

```text
Pair Reputation ≥ 70

AND

Bonding Curve Liquidity ≥ $10,000
```

Then:

```text
$ALICEBOB
→ liquidity deployed to DEX pool
→ normal open-market trading begins
```

This prevents pure hype from being the only graduation mechanism.

---

# 17. Why Investors Buy Pair Tokens

This question must have a clear answer.

Investors may buy a Pair Token because they believe:

```text
The Pair will remain active
        ↓
They will complete more milestones
        ↓
Reputation will increase
        ↓
More economic permissions will unlock
        ↓
More people may become interested
        ↓
Demand for the token may increase
```

Importantly, this is still a speculative market.

Stud should not pretend otherwise.

The innovation is that speculation is attached to **verified social progress and protocol permissions**, rather than being a completely context-free meme token.

---

# 18. Individual Prediction Markets

Stud can also support markets before or around matching.

Examples:

```text
Will Alice receive a mutual match this week?

Will Bob reach 5 verified matches this month?

Will Alice and Bob form a Pair?

Will this Pair reach Reputation Level 3 within 30 days?

Will this Pair graduate?
```

The strongest markets are those based on **objective protocol events**.

For example:

```text
Pair Reputation ≥ 50 by October 1
```

is much easier to settle than:

```text
Will Alice and Bob fall in love?
```

---

# 19. Separate Prediction Markets From Pair Token Price

Stud can contain both, but they are different systems.

## Prediction Market

A market asks a question.

```text
Will Alice and Bob reach Level 3 this month?

YES / NO
```

Once the deadline passes, it resolves.

---

## Pair Token Market

The Pair Token represents ongoing market demand around the Pair.

```text
$ALICEBOB
```

It does not resolve on one date.

It can continue evolving.

This distinction gives Stud two different financial primitives:

```text
Prediction markets
→ market on specific outcomes

Pair Tokens
→ market around persistent Pair identities
```

---

# 20. Sponsored Milestones

Milestones can also carry rewards.

Example:

```text
Sponsor:
Coffee Brand

Challenge:
"Complete a verified coffee-date milestone"

Reward:
$20
```

Flow:

```text
Sponsor funds reward
        ↓
Community challenge appears
        ↓
Alice + Bob accept
        ↓
They complete
        ↓
Both attest
        ↓
Pair reputation increases
        +
Reward unlocks
```

This gives Pair reputation utility beyond pure speculation.

---

# 21. The "Third Identity" Thesis

This is the most distinctive conceptual idea inside Stud.

Blockchain applications normally treat identities individually:

```text
Alice Wallet
Bob Wallet
```

Stud introduces:

```text
Alice Identity
+
Bob Identity
=
AliceBob Pair Identity
```

The Pair has:

- its own token,
- its own reputation,
- its own history,
- its own accepted milestones,
- its own market,
- its own lifecycle.

In other words:

> **The relationship edge becomes a first-class onchain entity.**

Instead of blockchain only modeling people and assets, Stud models **relationships themselves** as programmable objects.

---

# 22. Pair Lifecycle

A Pair should not need to exist forever.

A future version of Stud can support a full lifecycle:

```text
Birth
↓
Growth
↓
Maturity
↓
Graduation
↓
Continuation OR Dissolution
```

If Alice and Bob decide to end the Pair:

```text
Pair Token
→ frozen / retired / archived

Pair Reputation
→ final snapshot
```

Potentially, verified history could contribute back to each person's individual reputation.

For example:

```text
AliceBob Pair
Final Reputation: 82

Pair dissolved respectfully

Alice receives:
"Completed 12 verified Pair milestones"

Bob receives:
"Completed 12 verified Pair milestones"
```

This allows reputation to survive even when a particular relationship does not.

---

# 23. What Stud Is NOT

Stud is not intended to be:

### A protocol that judges love

Stud cannot prove emotions.

### A system where investors control users

Milestones require Pair consent.

### A system that automatically pumps token prices

Activities affect reputation, not price directly.

### A surveillance application

Real-world actions should not require invasive proof.

### Just another yield vault

The Pair identity and reputation mechanism is the core primitive.

---

# 24. Why Blockchain?

Stud does not need blockchain merely because it involves money.

Blockchain matters because the Pair can become a persistent, composable object.

Without blockchain:

```text
Dating App Match
→ database row
→ trapped inside application
```

With Stud:

```text
Verified Match
→ onchain Pair
→ reputation
→ token
→ market
→ liquidity
→ composable identity
```

Other applications could potentially recognize:

```text
Pair ID
Pair Reputation
Pair Age
Milestone Count
Graduation Status
```

The relationship becomes infrastructure.

---

# 25. Why DeFi?

DeFi gives the Pair an economic lifecycle.

The social layer provides:

```text
humans
matches
joint actions
reputation
```

The DeFi layer provides:

```text
market formation
bonding curves
liquidity
market caps
graduation
prediction markets
economic incentives
```

Together:

```text
Verified Human Activity
        ↓
Onchain Reputation
        ↓
Economic Permissions
        ↓
Open Markets
```

---

# 26. Hackathon MVP

For ETHGlobal Online, the MVP should stay focused.

## Essential Features

### 1. World ID Verification

```text
Connect Wallet
→ Verify World ID
→ Create Stud profile
```

### 2. Social Discovery

```text
View verified profiles
→ Swipe
→ Mutual match
```

### 3. Pair Creation

On match:

```text
Create Pair ID
Mint Pair Token
Initialize Pair Reputation
```

### 4. Milestone Proposals

```text
Community / investor proposes milestone
```

### 5. Pair Acceptance

```text
Alice accepts
Bob accepts
→ milestone activated
```

### 6. Mutual Attestation

```text
Alice attests
Bob attests
→ milestone completed
```

### 7. Reputation Engine

```text
Completed milestone
→ Pair reputation increases
```

### 8. Bonding-Curve Market

```text
Investor buys Pair Token
→ price changes based on demand
```

### 9. Reputation-Based Unlock

Example:

```text
Reputation 0–20
→ $500 market cap

Reputation 20+
→ $2,000 market cap
```

### 10. Graduation Demo

Show the end state:

```text
Enough reputation
+
Enough liquidity
→ Pair becomes graduation eligible
```

The MVP does not necessarily need a production-grade DEX deployment.

A clear graduation simulation or testnet integration can demonstrate the mechanism.

---

# 27. Example User Journey

## Step 1 - Alice Joins

Alice connects her wallet.

```text
World ID verified ✓
```

She creates her Stud profile.

---

## Step 2 - Bob Joins

Bob does the same.

```text
World ID verified ✓
```

---

## Step 3 - They Match

Alice likes Bob.

Bob likes Alice.

```text
Mutual Match ✓
```

Stud creates:

```text
Pair:
AliceBob

Token:
$ALICEBOB

Reputation:
0

Market Stage:
Stage 1
```

---

## Step 4 - Community Proposes a Challenge

An investor proposes:

> "Complete your first video call by Sunday."

Alice accepts.

Bob accepts.

The challenge becomes active.

---

## Step 5 - They Complete It

On Saturday:

```text
Alice → Attest
Bob → Attest
```

The contract verifies both.

```text
Milestone Completed ✓
```

---

## Step 6 - Pair Reputation Grows

```text
Before:
Reputation = 10

After:
Reputation = 20
```

This unlocks:

```text
Market Capacity:
$500 → $2,000
```

---

## Step 7 - Investors React

Investors see:

```text
Verified Pair
Completed Milestone
Higher Reputation
More Economic Capacity
```

Some decide to buy $ALICEBOB.

Demand increases.

The bonding curve price moves.

---

## Step 8 - The Pair Keeps Growing

Over several weeks:

```text
Milestones Completed: 8
Reputation: 75
Bonding Curve Liquidity: threshold reached
```

Stud displays:

```text
Graduation Eligible 🎓
```

The Pair Token can now move toward open liquidity.

---

# 28. Smart Contract Model

A possible contract architecture:

```text
StudRegistry
│
├── StudProfile
│
├── WorldIDVerification
│
├── MatchRegistry
│
├── PairFactory
│   └── Pair
│       ├── PairToken
│       ├── PairReputation
│       └── PairState
│
├── MilestoneManager
│
├── AttestationManager
│
├── BondingCurveMarket
│
└── GraduationManager
```

---

# 29. Possible Data Model

## Stud

```solidity
struct Stud {
    address owner;
    bytes32 worldIdNullifier;
    uint256 individualReputation;
    bool verified;
}
```

---

## Pair

```solidity
struct Pair {
    uint256 pairId;
    address userA;
    address userB;
    address pairToken;
    uint256 reputation;
    uint256 milestoneCount;
    uint256 createdAt;
    PairStage stage;
}
```

---

## Milestone

```solidity
struct Milestone {
    uint256 milestoneId;
    uint256 pairId;

    string description;

    address proposer;

    bool acceptedByA;
    bool acceptedByB;

    bool attestedByA;
    bool attestedByB;

    uint256 deadline;

    MilestoneStatus status;
}
```

---

# 30. Pair Stages

Example:

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

Stage transition example:

```text
New
  ↓ Reputation 20

Growing
  ↓ Reputation 50

Established
  ↓ Reputation 70 + liquidity threshold

Graduation Eligible
  ↓ LP deployed

Graduated
```

---

# 31. Reputation Engine - MVP

Keep the first version transparent.

Example:

```text
Match Created
+5

Accepted Milestone
+0

Completed Milestone
+10

Three Consecutive Completed Milestones
+10 bonus
```

Later, Stud can evolve into a richer reputation system.

The first version should be understandable enough that a user can answer:

> "Why is this Pair reputation 45?"

without needing a black-box algorithm.

---

# 32. Privacy

Dating and relationship data can be highly sensitive.

Stud should minimize what goes onchain.

Good onchain data:

```text
Pair exists
Pair reputation
Milestone hash
Milestone status
Attestation state
Market state
```

Avoid putting:

```text
private messages
exact locations
personal photos
sensitive relationship information
real names unless explicitly desired
```

Milestone details could be stored offchain with only a commitment/hash placed onchain.

---

# 33. Consent

Consent must be part of the protocol design.

A milestone should only become active when:

```text
Alice accepts
AND
Bob accepts
```

Investor:

```text
can propose
cannot force
```

Community:

```text
can suggest
cannot force
```

Pair:

```text
controls participation
```

This makes the social mechanics far healthier and also produces a cleaner product story.

---

# 34. Market Integrity

Stud should assume users may try to game financial incentives.

Potential attacks include:

```text
fake accounts
self-matching
multiple identities
fake attestations
wash trading
coordinated token manipulation
milestone farming
```

World ID helps with Sybil resistance.

Other future protections could include:

- reputation cooldowns,
- milestone frequency limits,
- market exposure caps,
- minimum Pair age,
- anti-wash-trading rules,
- challenge diversity requirements,
- graduated reputation weights.

For the hackathon MVP, simple market caps and World ID already provide a strong story.

---

# 35. Why This Is Interesting for ETHGlobal

Stud combines several crypto-native primitives in a way that is easy to demonstrate visually:

```text
Proof of Human
+
Social Graph
+
Onchain Reputation
+
Prediction Markets
+
Bonding Curves
+
Token Markets
+
Liquidity Graduation
```

The main innovation is not:

> "Dating app with a token."

It is:

> **A verified social relationship becomes a programmable onchain economic identity that can earn reputation and progressively unlock market permissions.**

---

# 36. Demo Story

A strong hackathon demo can be very simple.

### Screen 1

Alice connects wallet.

```text
World ID verified ✓
```

### Screen 2

Bob is shown.

Alice swipes right.

Bob has already liked Alice.

```text
IT'S A MATCH
```

### Screen 3

Animation:

```text
New Pair Born

Alice + Bob

$ALICEBOB

Pair Reputation: 0
Market Limit: $500
```

### Screen 4

Investor proposes:

```text
"Complete your first video call this week."
```

### Screen 5

Alice + Bob accept.

Later both attest.

```text
Milestone completed ✓

Pair reputation:
10 → 20
```

### Screen 6

Protocol displays:

```text
NEW LEVEL UNLOCKED

Market Limit:
$500 → $2,000
```

### Screen 7

Investor buys Pair Token.

Bonding curve moves.

### Screen 8

Show future state:

```text
Reputation: 75
Liquidity Threshold: Reached

PAIR READY TO GRADUATE
```

That communicates the entire concept within a few minutes.

---

# 37. Potential Future Directions

Stud can evolve well beyond dating.

## Pair Credit

A mature Pair reputation could eventually be used as an input for credit decisions.

```text
Strong shared history
→ access to specialized credit
```

This should be considered a later-stage experiment, not an MVP promise.

---

## Pair DAOs

Multiple established Pairs could form groups.

```text
Pair A
Pair B
Pair C
    ↓
Social Collective
```

---

## Pair-to-Pair Markets

Markets could emerge around Pair competitions or collaborative milestones.

---

## Sponsored Social Experiences

Restaurants, games, travel companies, event organizers, and communities could sponsor challenges.

---

## Pair Reputation Portability

Other protocols could query:

```text
Is this Pair verified?
How old is it?
What is its reputation?
How many milestones has it completed?
Has it graduated?
```

---

## Full Relationship Lifecycle

```text
Match
→ Pair Birth
→ Growth
→ Maturity
→ Graduation
→ Retirement
```

When retired, Pair history could become attestations attached to individual identities.

---

# 38. Product Principles

Stud should follow five principles.

### 1. Humans First

World ID ensures the system begins with real people.

### 2. Consent First

Investors may propose.

Pairs decide.

### 3. Reputation Before Capital

Economic permissions grow only after verified history develops.

### 4. Reputation ≠ Price

The protocol changes reputation.

The market changes price.

### 5. Relationships as Infrastructure

The Pair is not just UI state.

It becomes a programmable onchain entity.

---

# 39. One-Sentence Pitch

> **Stud is a World ID–verified social and DeFi protocol where a mutual match creates a new shared onchain identity whose reputation grows through consent-based joint milestones and progressively unlocks larger markets and liquidity.**

---

# 40. Short Pitch

Stud begins like a dating app for verified humans.

Users verify with World ID, discover people, and match.

But when Alice and Bob match, Stud creates something new: a **Pair Token**, representing their shared onchain identity.

Community members and investors can propose milestones for the Pair, but Alice and Bob decide which ones to accept.

When both complete and attest to an accepted milestone, their Pair reputation increases.

Reputation does not artificially pump token price. Instead, it unlocks progressively larger economic permissions-higher market limits, sponsored challenges, and eventually eligibility to graduate from a controlled bonding curve into an open liquidity pool.

**Two humans match. A third identity is born. That identity grows socially and economically onchain.**

---

# 41. Current Hackathon Thesis

The current direction for Stud is:

```text
WORLD ID
    ↓
REAL HUMANS
    ↓
SOCIAL MATCH
    ↓
PAIR TOKEN / THIRD IDENTITY
    ↓
CONSENT-BASED MILESTONES
    ↓
MUTUAL ATTESTATIONS
    ↓
PAIR REPUTATION
    ↓
ECONOMIC PERMISSIONS
    ↓
BONDING-CURVE MARKET
    ↓
GRADUATION
```

That is the core product.

Everything else should support this loop rather than distract from it.
