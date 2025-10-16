## 🥊 What this is

A modular Solidity project exploring how combat sports scoring could work on Ethereum. It separates responsibilities into simple, auditable contracts:

### Core Contracts
- **`FighterReg.sol`** — register fighters and look them up *(to be replaced with an oracle)*
- **`JudgeReg.sol`** — register and manage approved judges
- **`MatchReg.sol`** — create and track matches, link fighters and judges *(to be replaced with an oracle)*
- **`Scoring.sol`** — submit and aggregate round-by-round scores for each match
- **`Consensus.sol`** — determine winners based on judge scores and majority logic
- **`JudgeRanking.sol`** — track judge accuracy, alignment, and adjust rankings over time

---

## 📄 Contract Overview

### `FighterReg.sol`
- Add fighters with basic metadata
- Retrieve fighters by ID or wallet address
- Emit events for new registrations

### `JudgeReg.sol`
- Register and manage approved judges
- Check if an address is an active judge
- Emit events for additions and removals

### `MatchReg.sol`
- Create matches between two fighters
- Link judges and store metadata (rounds, status, timestamps)
- Validate that fighters and judges exist

### `Scoring.sol`
- Judges submit round scores for a given match
- Prevent duplicate submissions for the same judge and round
- Aggregate total scores and return per-round results
- Emit scoring events for transparency

### `Consensus.sol`
- Calculate the winner based on majority judge decisions
- Compare total scores across judges
- Emit final decision events for auditability

### `JudgeRanking.sol`
- Track judge alignment with consensus outcomes
- Adjust rankings based on accuracy and agreement
- Emit ranking updates and support incentive logic

---

## ⚙️ Getting Started

You can deploy and test these contracts in **Remix IDE** or **Hardhat**.

### Option A: Remix IDE
1. Open [Remix](https://remix.ethereum.org)
2. Create a new workspace and upload all `.sol` files
3. In **Solidity Compiler**:
   - Match compiler version to pragma
   - Enable optimization if needed
4. In **Deploy & Run Transactions**:
   - Deploy `FighterReg`, `JudgeReg`, `MatchReg`, `Scoring`, `Consensus`, and `JudgeRanking`
   - Pass constructor arguments if required
5. Interact with contracts via the Remix UI and monitor events in the console

### Option B: Hardhat (recommended for local testing)
```bash
mkdir fight-scoring && cd fight-scoring
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```
Copy your `.sol` files into the `contracts` folder and write tests in the `test` directory.

---

🧠 Roadmap
- [x] Modular scoring contracts
- [x] Judge consensus via Result[] and winCount
- [x] Judge ranking based on majority alignment
- [ ] View function for majority winner
- [ ] Win percentage + judge alignment scoring
- [ ] Incentive payout for accurate judges
- [ ] Dynamic fighter ranking (Elo-style or win-based)
- [ ] Map fightId to fight names
- [ ] Oracle integration (Sherdog)

---

## 🧪 Future Vision

Once the on-chain logic is stable, external oracles (like Sherdog or other MMA data sources) will replace local registries for real-time fighter and match data. The end goal is an **open, auditable system** where fight results and judging decisions can be verified transparently on-chain.