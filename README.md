## 🥊 What this is

A small Solidity project exploring how combat sports scoring could work on Ethereum.
It separates responsibilities into simple, modular contracts:

* **`FighterReg.sol`** — register fighters and look them up *(to be replaced with an oracle)*
* **`JudgeReg.sol`** — register and manage approved judges
* **`MatchReg.sol`** — create and track matches, link fighters and judges *(to be replaced with an oracle)*
* **`Scoring.sol`** — submit and aggregate round-by-round scores for each match

---

## 📜 Contract Overview

### `FighterReg.sol`

* Add fighters with basic metadata
* Retrieve fighters by ID or wallet address
* Emit events for new registrations

### `JudgeReg.sol`

* Register and manage approved judges
* Check if an address is an active judge
* Emit events for additions and removals

### `MatchReg.sol`

* Create matches between two fighters
* Link judges and store metadata (rounds, status, timestamps)
* Validate that fighters and judges exist

### `Scoring.sol`

* Judges submit round scores for a given match
* Prevent duplicate submissions for the same judge and round
* Aggregate total scores and return per-round results
* Emit scoring events for transparency

> For implementation details, see the Solidity files for structs, mappings, modifiers, and events.

---

## ⚙️ Getting Started

You can deploy and test these contracts in **Remix IDE** or **Hardhat**.

### Option A: Remix IDE

1. Open [Remix](https://remix.ethereum.org).
2. Create a new workspace and upload all `.sol` files.
3. In the **Solidity Compiler** tab:

   * Select the compiler version matching the pragma in each contract.
   * Enable optimization if needed.
4. In **Deploy & Run Transactions**:

   * Deploy `FighterReg`, `JudgeReg`, `MatchReg`, then `Scoring`.
   * Pass any constructor arguments your version requires.
5. Interact with contracts via the Remix UI and monitor events in the console.

### Option B: Hardhat (recommended for local testing)

```bash
mkdir fight-scoring && cd fight-scoring
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

From there, copy your `.sol` files into the `contracts` folder and write tests in the `test` directory.

---

## 🚧 To Do

1. Add a **view function** to calculate the winner
2. Compare scores across multiple judges for an individual fight
3. Compute **percentage of who won**
4. Compare those percentages to each judge’s scores
5. Implement **reward splitting** between judges who predicted correctly
6. Adjust rankings — winner’s rank +1, loser’s rank −1 *(to be replaced with Elo system)*
7. Add a mapping to connect `uint fightId` to **fight names**
8. Replace **FighterReg** with a **Sherdog oracle**
9. Replace **MatchReg** with a **Sherdog oracle**

---

## 🧩 Future Vision

Once the on-chain logic is stable, external oracles (like Sherdog or other MMA data sources) will replace local registries for real-time fighter and match data.
The end goal is an **open, auditable system** where fight results and judging decisions can be verified transparently on-chain.