```markdown
# Fight Scoring — Collusion-Resistant On-Chain Judging

A minimal on-chain system for scoring fights with a focus on integrity, auditability, and adversarial inputs. Judges submit round scores, the system aggregates per-judge winners and produces a majority winner, then rewards aligned judges.

This repo is being hardened for security-oriented hackathons using commit–reveal, strict phase timing, and clean invariants.

---

## Table of Contents
- [Motivation](#motivation)
- [High-Level Design](#high-level-design)
- [Contracts](#contracts)
- [Security Model](#security-model)
  - [Commit–Reveal](#commitreveal)
  - [Phases and Deadlines](#phases-and-deadlines)
  - [Events](#events)
- [Data Model](#data-model)
- [Development](#development)
- [Testing](#testing)
- [Demo Script (90 seconds)](#demo-script-90-seconds)
- [Prioritized To-Do List](#prioritized-to-do-list)
- [License](#license)

---

## Motivation
Aggregating sensitive human inputs on-chain is hard. Scores are low-entropy and easy to guess or front-run. Collusion can sway outcomes. This project demonstrates a compact pattern to:
- bind scores to a judge and round,
- hide them until reveal,
- enforce one submission per judge per round,
- compute a majority winner from persisted, auditable results,
- pay aligned judges while tracking reputation.

---

## High-Level Design
**Flow**
1. Register fighters, matches, and judges.
2. **Commit phase:** each judge commits a hash of their round scores with a private salt.
3. **Reveal phase:** judge reveals scores and salt; contract verifies commitment, accepts exactly once.
4. After all rounds, finalize the fight:
   - compute per-judge winners,
   - persist results for this fight,
   - determine the majority winner (or draw),
   - update judge reputation,
   - enable payouts from a separate token.

**Why this way**
- Commit–reveal prevents guessing and front-running of low-range scores.
- Storing results once avoids O(n) scans over historical data.
- Clear events and phase checks make audits and demos painless.

---

## Contracts
- `FighterReg.sol` — registers fighters.
- `JudgeReg.sol` — registers judges and owners.
- `MatchReg.sol` — creates matches and sets round counts.
- `Scoring.sol` — per-round judge scoring (migrating to commit–reveal).
- `JudgeConsensus.sol` — per-judge winners and majority winner for a fight.
- `JudgeRankPayout.sol` — judge reputation and payouts (will hold a token reference).
- `FightPoint.sol` — ERC20 implementation used for payouts (will be externalized).

> Note: some names and shapes will be tightened as part of the to-do list.

---

## Security Model

### Commit–Reveal
Judges commit before the commit deadline, then reveal between commit and reveal deadlines.

**Commit (off-chain):**
```

commitment = keccak256(abi.encode(
"FIGHT_SCORING_V1",
judgeAddress,
fightId,
roundId,
scoreA,         // uint8
scoreB,         // uint8
salt            // bytes32 random
));

````

**On-chain storage:**
```solidity
mapping(uint256 => mapping(uint256 => mapping(address => bytes32))) public commitOf;
// fightId => roundId => judge => commitment

mapping(uint256 => mapping(uint256 => mapping(address => bool))) public revealed;
````

**Reveal:**

```solidity
require(block.timestamp >= commitDeadline && block.timestamp < revealDeadline, "Phase");
require(!revealed[fightId][roundId][msg.sender], "Already revealed");

bytes32 expected = keccak256(abi.encode(
  "FIGHT_SCORING_V1",
  msg.sender,
  fightId,
  roundId,
  scoreA,
  scoreB,
  salt
));
require(commitOf[fightId][roundId][msg.sender] == expected, "Bad reveal");

// accept score once
revealAndStore(...);
```

**Salt rules**

* 32 random bytes, new per commit.
* Keep it secret until reveal.
* Never derive from predictable chain data.

### Phases and Deadlines

Per fight and round:

```solidity
struct Phase { uint64 commitDeadline; uint64 revealDeadline; }
mapping(uint256 => mapping(uint256 => Phase)) public phaseOf;
```

* Commit allowed: `now < commitDeadline`
* Reveal allowed: `commitDeadline <= now < revealDeadline`
* Submissions outside windows revert.

### Events

Emit on every state transition:

* `ScoreCommitted(judge, fightId, roundId, commitment)`
* `ScoreRevealed(judge, fightId, roundId, scoreA, scoreB)`
* `RoundClosed(fightId, roundId)`
* `ResultStored(fightId, judge, winnerId)`
* `MajoritySet(fightId, winnerId)`
* `JudgeRankChanged(judgeId, newRank)`
* `PayoutSent(judge, amount)`

---

## Data Model

**Scores**

```solidity
struct Score { uint8 a; uint8 b; bool exists; }
mapping(uint256 => mapping(uint256 => mapping(uint256 => Score))) public scoreOf;
// fightId => roundId => judgeId
```

**Judge assignment**

```solidity
mapping(uint256 => uint256[]) public judgeIdsByFight; // fightId => list of judgeIds
```

**Results per fight**

```solidity
struct Result { uint256 judgeId; uint256 winnerId; } // winnerId: fighterAId, fighterBId, or 0 for draw
mapping(uint256 => Result[]) public resultsByFight; // recomputed & stored once at finalization
```

**Token for payouts**

```solidity
IERC20 public token; // set in constructor; do not inherit ERC20 in payout contract
```

---

## Development

### Prereqs

* Node 18+
* PNPM or NPM
* Foundry (recommended) or Hardhat

### Install

```bash
pnpm install
# or npm ci
```

### Build & Lint

```bash
# Foundry
forge build
# Static analysis (optional but encouraged)
slither .
solhint 'contracts/**/*.sol'
```

---

## Testing

### Unit tests

* One submission per judge per round.
* Score bounds `0..10`.
* Duplicate commit or reveal reverts.
* Late commit or reveal reverts.

### Property / fuzz (Foundry or Echidna)

* Totals never overflow.
* Majority winner invariant is permutation-independent.
* Finalization is idempotent.
* No cross-fight data leakage.

### Suggested scripts

```bash
forge test -vv
npm run slither
npm run coverage
```

---

## Demo Script (90 seconds)

1. Deploy registries, scoring, consensus, payout with token address.
2. Register fighters A/B and three judges.
3. Create match with N rounds and set per-round deadlines.
4. For Round 1:

   * Judge commits `keccak256(encode(..., salt))`.
   * Try to reveal early (revert), then reveal in window (success).
   * Attempt duplicate reveal (revert).
5. Finalize fight:

   * Contract stores per-judge winners and majority.
   * Reputation updated, payouts enabled.
6. Call payout. Show `PayoutSent` events.

---

## Prioritized To-Do List

### Easiest

1. **Rename misleading params/modifiers**
   Make names match roles, e.g. fix `onlyFighter(uint _judgeId)`.
2. **Enforce score bounds**
   Centralize `require(score <= 10)` checks for A and B.
3. **Emit events**
   Add all events listed in [Events](#events).
4. **One submission per judge per round**
   Use `scoreOf[fightId][roundId][judgeId]` with `exists` flag. Reject duplicates.
5. **Tighten types**
   Use `uint8` for scores, `uint16` for round counts, `uint64` for timestamps.
6. **Delete dead state**
   Remove or start using any unreferenced mappings and arrays.

### Still easy, slightly spicier

7. **Fix array misuse in payouts**
   Iterate arrays you actually populate (`winningJudgeA`/`winningJudgeB`) and remove stray `winningJudges`.
8. **Reset per-fight counters**
   Zero counters like `judgeCountA/B` at the start of each calculation.
9. **Separate token from payout logic**
   Hold `IERC20 token` in storage instead of inheriting `ERC20` in the payout contract.
10. **Access control**
    Restrict who can create matches, assign judges, finalize fights, and trigger payouts.

### Medium

11. **Persist results once**
    On finalization, write `resultsByFight[fightId]` and stop rescanning global arrays.
12. **Correct majority winner**
    Implement a clean tally for two fighters plus draw; handle 1/2/3-judge cases deterministically.
13. **Index data**
    Replace global scans with `scoreOf` and `judgeIdsByFight`. Reads should be O(rounds × judges) per fight.
14. **Phase-aware writes**
    Disallow scoring or revealing outside the correct window, even before full commit–reveal lands.
15. **Payouts from stored winners**
    Compute winners once, pay from that list, revert if empty.

### Hard

16. **Add commit–reveal**
    Bind to `(judge, fightId, roundId, scoreA, scoreB, salt)` with a domain tag.
17. **Add round timing**
    `commitDeadline` and `revealDeadline` per round, strictly enforced.
18. **Reputation mechanics**
    Update rank with correct vs majority; cap step size so one fight can’t nuke rank.
19. **Challenge window**
    Allow third parties to challenge invalid reveals; loser pays bounty.
20. **Property-based tests and fuzzing**
    Invariants for uniqueness, bounds, phase discipline, and majority stability.
21. **Static analysis + CI**
    Wire `slither`, `solhint`, coverage; fail CI on missing checks or unchecked returns.
22. **Finalization pipeline**
    Single entry point: close reveal, store results, set majority, update reputation, emit events, unlock payout. Idempotent.

### Optional (polish and prize bait)

23. **Judge gating**
    Allowlist or attestations for judge eligibility; public can still verify results.
24. **VRF spot checks**
    Randomly force some rounds to reveal first to stress coordination.
25. **Minimal ZK privacy**
    Prove “score in 0..10 and matches commit” without exposing linkage across rounds.

---

## License

MIT
::contentReference[oaicite:0]{index=0}
```
