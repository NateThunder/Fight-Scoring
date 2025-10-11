# Fight Scoring

Tools and smart contracts for registering fighters and judges, creating matches, and recording round-by-round scores on-chain.

## What this is

A small Solidity project that explores how combat sports scoring could work on Ethereum. It separates responsibilities into simple contracts:

- **FighterReg.sol** — register fighters and look them up (will be replaced with oricle).
- **JudgeReg.sol** — register approved judges.
- **MatchReg.sol** — create and track matches, link fighters and judges.
- **Scoring.sol** — submit and aggregate round scores for a match.

> Goal: make scoring transparent and auditable while keeping the logic straightforward.

## Contract overview

### FighterReg
- Add a fighter with basic metadata.
- Get a fighter by id or address.
- Emit events for new registrations.

### JudgeReg
- Add and manage approved judges.
- Check if an address is an active judge.
- Emit events for changes.

### MatchReg
- Create a match with two fighters and the judging panel.
- Store match status, number of rounds, and timing data.
- Guardrails to ensure fighters and judges exist.

### Scoring
- Judges submit scores per round for a given match.
- Prevent duplicate scoring for the same judge and round.
- Aggregate scores and expose per-round and total results.
- Emit events for transparency.

> Names may vary slightly from the implementation. Read the Solidity files for exact structs, mappings, modifiers, and events.

## Getting started

You can use these contracts in **Remix IDE** or in a local **Hardhat** workspace.

### Option A: Remix IDE
1. Open [Remix](https://remix.ethereum.org).
2. Create a workspace and upload the `.sol` files in the root of your project.
3. In the **Solidity Compiler** tab:
   - Select the compiler version that matches the pragma in the contracts.
   - Enable optimization if needed.
4. In **Deploy & Run**:
   - Deploy `FighterReg`, `JudgeReg`, `MatchReg`, then `Scoring`.
   - Pass any constructor args that your version requires.
5. Use the UI to call functions and verify events in the Remix console.

### Option B: Hardhat (suggested for testing)
1. Create a new project:
   ```bash
   mkdir fight-scoring && cd fight-scoring
   npm init -y
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
