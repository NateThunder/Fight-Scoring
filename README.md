# Fight-Scoring (Ethereum Smart Contracts)

Transparent, auditable fight scoring on-chain: register fighters and judges, submit round scores, reach judge consensus, and reward aligned judges.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

---

## Table of Contents

1. [Overview](#overview)  
2. [Architecture & Modules](#architecture--modules)  
3. [Contract API & Key Functions](#contract-api--key-functions)  
4. [Setup & Usage](#setup--usage)  
5. [Example Flows](#example-flows)  
6. [Future Roadmap](#future-roadmap)  
7. [Security & Caveats](#security--caveats)  
8. [License & Credits](#license--credits)

---

## Overview

This project implements a modular system for scoring fights on Ethereum:

- Fighters and judges can be registered on-chain  
- Matches are created by specifying participant fighters and judge panels  
- Judges submit per-round scores  
- A consensus logic computes the winner  
- Judges are tracked and rewarded based on alignment with consensus  

Use this for testing, prototyping, or as a basis for more advanced scoring systems or oracle integration.

---

## Architecture & Modules

Here’s a breakdown of your contracts and how they interact:

| Module | Responsibility |
|---|---|
| `FighterReg.sol` | Register, query, and manage fighter identities |
| `JudgeReg.sol` | Register, query, and manage judges |
| `MatchReg.sol` | Create matches, link fighters + judges |
| `Scoring.sol` | Judges submit scores for each round |
| `JudgeConsensus.sol` | Aggregate judge scores and determine winner |
| `JudgeRankPayout.sol` | Track judge alignment and handle incentive payouts |

The flow is: register entities → create match → judges submit rounds → consensus determines winner → update judge stats & payouts.

---

## Contract API & Key Functions

Below are representative function signatures (adjust param names as in your code). Use these in your README so users know what methods are available.

### FighterReg.sol

```solidity
function registerFighter(address owner, string calldata name) external returns (uint256 fighterId);
function getFighter(uint256 fighterId) external view returns (address owner, string memory name);
function totalFighters() external view returns (uint256);

JudgeReg.sol

function registerJudge(address judgeAddr, string calldata name) external returns (uint256 judgeId);
function getJudge(uint256 judgeId) external view returns (address judgeAddr, string memory name);
function totalJudges() external view returns (uint256);

MatchReg.sol

function createMatch(
  uint256 fighterAId,
  uint256 fighterBId,
  uint256[] calldata judgeIds
) external returns (uint256 matchId);

function getMatch(uint256 matchId) external view returns (
  uint256 fighterA,
  uint256 fighterB,
  uint256[] memory judgeIds
);

Scoring.sol

function submitRoundScore(
  uint256 matchId,
  uint8 roundNumber,
  uint256 judgeId,
  uint256 fighterAScore,
  uint256 fighterBScore
) external;

function getRoundScore(
  uint256 matchId,
  uint8 roundNumber,
  uint256 judgeId
) external view returns (uint256 fighterAScore, uint256 fighterBScore);

JudgeConsensus.sol

function computeWinner(uint256 matchId) external view returns (uint256 winningFighterId);

function getJudgeConsensusScore(uint256 matchId, uint256 judgeId) external view returns (uint256 totalAScore, uint256 totalBScore);

JudgeRankPayout.sol

function updateJudgeRank(uint256 judgeId) external;
function rewardJudges(uint256 matchId) external;
function getJudgeRank(uint256 judgeId) external view returns (uint256 rankScore);

(If your code uses different names or extra parameters, replace them accordingly.)

⸻

Setup & Usage

Prerequisites
	•	Node ≥ 18
	•	npm (or pnpm)
	•	Hardhat
	•	(Optional) .env with RPC & private key for deployment

Getting started

git clone https://github.com/NateThunder/Fight-Scoring.git
cd Fight-Scoring
npm install

Compile:

npx hardhat compile

Run tests:

npx hardhat test


⸻

Example Flows

Here’s how someone could use your system in a script (TypeScript + ethers v6 style):

import { ethers } from "hardhat";

async function scenario() {
  const [deployer] = await ethers.getSigners();

  const FighterReg = await ethers.getContractFactory("FighterReg");
  const fighterReg = await FighterReg.deploy();
  await fighterReg.waitForDeployment();

  const JudgeReg = await ethers.getContractFactory("JudgeReg");
  const judgeReg = await JudgeReg.deploy();
  await judgeReg.waitForDeployment();

  const MatchReg = await ethers.getContractFactory("MatchReg");
  const matchReg = await MatchReg.deploy();
  await matchReg.waitForDeployment();

  const Scoring = await ethers.getContractFactory("Scoring");
  const scoring = await Scoring.deploy();
  await scoring.waitForDeployment();

  const JudgeConsensus = await ethers.getContractFactory("JudgeConsensus");
  const consensus = await JudgeConsensus.deploy();
  await consensus.waitForDeployment();

  const JudgeRankPayout = await ethers.getContractFactory("JudgeRankPayout");
  const payout = await JudgeRankPayout.deploy();
  await payout.waitForDeployment();

  // Register fighters
  const fighterAId = await fighterReg.registerFighter(deployer.address, "Alpha");
  const fighterBId = await fighterReg.registerFighter(deployer.address, "Bravo");

  // Register judges
  const judge1 = await judgeReg.registerJudge(deployer.address, "Judge 1");
  const judge2 = await judgeReg.registerJudge(deployer.address, "Judge 2");
  const judge3 = await judgeReg.registerJudge(deployer.address, "Judge 3");

  // Create match
  const matchId = await matchReg.createMatch(fighterAId, fighterBId, [judge1, judge2, judge3]);

  // Judges submit round scores
  await scoring.submitRoundScore(matchId, 1, judge1, 10, 9);
  await scoring.submitRoundScore(matchId, 1, judge2, 9, 10);
  await scoring.submitRoundScore(matchId, 1, judge3, 10, 9);

  // ... more rounds

  // Compute winner
  const winner = await consensus.computeWinner(matchId);
  console.log("Winner fighter id:", winner);
}

You can similarly show UI or Remix flows.

⸻

Future Roadmap
	•	Better tie-break logic (e.g. split decisions)
	•	Weighting judges by past performance
	•	Elo or ranking for fighters
	•	Integrate with oracles for match metadata
	•	Gas optimizations & batching submissions
	•	Audit & hardened security

⸻

Security & Caveats
	•	Research / prototype only — do not use without a security audit
	•	Prevent duplicate submissions per judge/round
	•	Handle edge cases (ties, missing judges)
	•	Validate inputs (round number bounds, valid match/judge/fighter IDs)
	•	Protect against reentrancy, overflows, gas limits

⸻

License & Credits

This project is currently unlicensed. If you want to allow use, you might add an MIT or AGPL license.

Developed by Nathan. Contributions welcome—if you fix bugs, I (the AI) might pretend to care.