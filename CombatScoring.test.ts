import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Combat Scoring end‑to‑end tests
 *
 * NOTE: some function names in the contracts look a bit inconsistent in the sources you shared
 * (e.g. `_registerJudge`, potential `_registerFighter`, `setMatch`, per‑round scoring).
 * If a call below fails to compile, check the TODOs and rename to match your actual functions.
 *
 * Tested flow:
 * 1) owner registers 3 judges
 * 2) register 2 fighters
 * 3) create a 3‑round fight
 * 4) each judge scores all 3 rounds
 * 5) per‑judge winner is derived from totals
 * 6) consensus winner is majority of judges
 * 7) rankings are updated for judges who matched the majority
 */
describe("JudgeRank / consensus flow", function () {
  async function deployAll() {
    const [owner, j1, j2, j3, rando] = await ethers.getSigners();

    // Deploy the *top* contract – it inherits the whole stack.
    const JudgeRank = await ethers.getContractFactory("JudgeRank");
    const sys = await JudgeRank.connect(owner).deploy();
    await sys.waitForDeployment();

    return { sys, owner, j1, j2, j3, rando };
  }

  // Simple helper to mine a tx
  async function tx(p: Promise<any>) {
    const sent = await p;
    return sent.wait();
  }

  it("full scoring + consensus + ranking", async () => {
    const { sys, owner, j1, j2, j3 } = await deployAll();

    // ---------- 1) register judges ----------
    // TODO: if your function is named `registerJudge`, rename below.
    await tx(sys.connect(j1)["_registerJudge"]("Alice"));
    await tx(sys.connect(j2)["_registerJudge"]("Bob"));
    await tx(sys.connect(j3)["_registerJudge"]("Caro"));

    // spot‑check the storage shape the contracts suggest
    // `judges(uint)` -> (name, rank, rightDecision, wrongDecision)
    const j1Rec = await sys.judges(1);
    expect(j1Rec.name || j1Rec[0]).to.exist;

    // ---------- 2) register fighters ----------
    // TODO: if your function is named `registerFighter` or similar, rename below.
    await tx(sys["_registerFighter"]?.("Fighter A") ?? sys["registerFighter"]("Fighter A"));
    await tx(sys["_registerFighter"]?.("Fighter B") ?? sys["registerFighter"]("Fighter B"));

    const fAId = 0; // assumed first fighter id
    const fBId = 1; // assumed second fighter id

    // ---------- 3) create a match (3 rounds) ----------
    // MatchReg shows `setMatch(uint,uint,uint8)` and a roundLimit modifier for 3 or 5
    const rounds = 3;
    await tx(sys.setMatch(fAId, fBId, rounds));

    const fightId = 0; // assume first match gets id 0

    // ---------- 4) each judge scores all rounds ----------
    // Scoring event: FightScore(fightId, roundId, scoreA, scoreB, judgeId)
    // TODO: if your scoring function is named `scoreRound` or `setRoundScore`, rename below.
    const score = async (who: any, r: number, a: number, b: number) => {
      if ("scoreRound" in sys) return tx((sys as any).connect(who).scoreRound(fightId, r, a, b));
      if ("setRoundScore" in sys) return tx((sys as any).connect(who).setRoundScore(fightId, r, a, b));
      // fallback: try a generic `score` name
      return tx((sys as any).connect(who).score(fightId, r, a, b));
    };

    // Give Fighter A a 29‑28, B a 30‑27, A a 29‑28 -> majority winner A (2 of 3)
    // Judge 1 (A 29‑28): A wins rounds 1 and 3, B wins round 2
    await score(j1, 1, 10, 9);
    await score(j1, 2, 9, 10);
    await score(j1, 3, 10, 9);

    // Judge 2 (B 30‑27): B sweeps
    await score(j2, 1, 9, 10);
    await score(j2, 2, 9, 10);
    await score(j2, 3, 9, 10);

    // Judge 3 (A 29‑28)
    await score(j3, 1, 10, 9);
    await score(j3, 2, 9, 10);
    await score(j3, 3, 10, 9);

    // ---------- 5) per‑judge winners ----------
    // Scoring.sol shows a view returning (winnerId, winnerName, judgeName)
    // TODO: if function name differs, adjust below (try `judgeResult` or `getResult`).
    const getWinner = async (fight: number, judgeId: number) => {
      if ("getWinner" in sys) return sys.getWinner(fight, judgeId);
      if ("judgeWinner" in sys) return (sys as any).judgeWinner(fight, judgeId);
      return (sys as any).winnerOf(fight, judgeId);
    };

    const w1 = await getWinner(fightId, 1);
    const w2 = await getWinner(fightId, 2);
    const w3 = await getWinner(fightId, 3);

    // check tuple shape defensively (either named or positional returns)
    const w1Id = (w1.winnerId ?? w1[0]) as bigint;
    const w2Id = (w2.winnerId ?? w2[0]) as bigint;
    const w3Id = (w3.winnerId ?? w3[0]) as bigint;

    expect([w1Id, w2Id, w3Id].map(Number)).to.have.members([fAId, fBId, fAId]);

    // ---------- 6) consensus majority ----------
    // JudgeConsensus shows `JudgingMajority(uint)` -> winnerId
    const maj = await (sys as any).JudgingMajority(fightId);
    expect(Number(maj)).to.equal(fAId);

    // ---------- 7) apply ranking and assert tallies ----------
    await tx(sys.ranking(fightId));

    // two judges matched the majority; one did not
    const j1After = await sys.judges(1);
    const j2After = await sys.judges(2);
    const j3After = await sys.judges(3);

    const idx = (o: any, k: number) => o[k] ?? 0n; // for positional structs

    const j1Rank = (j1After.rank ?? idx(j1After, 1)) as bigint;
    const j2Rank = (j2After.rank ?? idx(j2After, 1)) as bigint;
    const j3Rank = (j3After.rank ?? idx(j3After, 1)) as bigint;

    const j1Right = (j1After.rightDecision ?? idx(j1After, 2)) as bigint;
    const j2Right = (j2After.rightDecision ?? idx(j2After, 2)) as bigint;
    const j3Right = (j3After.rightDecision ?? idx(j3After, 2)) as bigint;

    const j1Wrong = (j1After.wrongDecision ?? idx(j1After, 3)) as bigint;
    const j2Wrong = (j2After.wrongDecision ?? idx(j2After, 3)) as bigint;
    const j3Wrong = (j3After.wrongDecision ?? idx(j3After, 3)) as bigint;

    expect(Number(j1Rank)).to.equal(2); // start at 1, +1 for correct
    expect(Number(j2Rank)).to.equal(0); // start at 1, -1 for wrong (floored at 0 by contract)
    expect(Number(j3Rank)).to.equal(2);

    expect(Number(j1Right)).to.equal(1);
    expect(Number(j2Right)).to.equal(0);
    expect(Number(j3Right)).to.equal(1);

    expect(Number(j1Wrong)).to.equal(0);
    expect(Number(j2Wrong)).to.equal(1);
    expect(Number(j3Wrong)).to.equal(0);
  });

  it("enforces round limits and prevents double‑scoring a round", async () => {
    const { sys, j1 } = await deployAll();
    await (sys as any).connect(j1)["_registerJudge"]("Judge");
    await (sys as any)["_registerFighter"]?.("X") ?? (sys as any)["registerFighter"]("X");
    await (sys as any)["_registerFighter"]?.("Y") ?? (sys as any)["registerFighter"]("Y");

    await expect(sys.setMatch(0, 1, 4)).to.be.revertedWith("Out with round limit"); // only 3 or 5

    await (sys as any).setMatch(0, 1, 3);
    // first scoring should pass, second should revert (duplicate submission guard)
    const tryScore = async () => {
      if ("scoreRound" in sys) return (sys as any).connect(j1).scoreRound(0, 1, 10, 9);
      if ("setRoundScore" in sys) return (sys as any).connect(j1).setRoundScore(0, 1, 10, 9);
      return (sys as any).connect(j1).score(0, 1, 10, 9);
    };
    await expect(tryScore()).to.not.be.reverted;
    await expect(tryScore()).to.be.reverted; // expected generic revert on duplicate
  });
});
