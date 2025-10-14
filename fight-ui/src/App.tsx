import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";

/**
 * Fight Scoring Dapp
 * Single-file React component. Drop into a Vite + React + Tailwind project and render <App />.
 *
 * How to use quickly:
 * 1) Paste your deployed contract address below.
 * 2) Paste your ABI JSON where indicated or keep the hybrid ABI provided here.
 * 3) Connect wallet, then try the flows: register judge/fighter, create match, score rounds, get winners, apply ranking.
 *
 * Notes:
 * - The contract names in your repo have a few variants. To reduce friction, the dapp tries multiple fallback names
 *   for known functions (e.g., _registerJudge vs registerJudge, scoreRound vs setRoundScore vs score).
 * - Scoring must be performed from an account that is a registered judge in the contract.
 */

// 1) PASTE YOUR DEPLOYED ADDRESS HERE
const DEFAULT_ADDRESS = "0xYourDeployedJudgeRankAddress"; // replace after deploy

// 2) ABI: You can paste the full ABI from artifacts for JudgeRank.json.
// Below is a hybrid ABI that covers the calls used in this UI with multiple name variants.
const HYBRID_ABI = [
  // judge registration variants
  {
    type: "function", name: "_registerJudge", stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }], outputs: []
  },
  {
    type: "function", name: "registerJudge", stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }], outputs: []
  },
  // fighter registration variants
  {
    type: "function", name: "_registerFighter", stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }], outputs: []
  },
  {
    type: "function", name: "registerFighter", stateMutability: "nonpayable",
    inputs: [{ name: "name", type: "string" }], outputs: []
  },
  // match creation
  {
    type: "function", name: "setMatch", stateMutability: "nonpayable",
    inputs: [
      { name: "fighterAId", type: "uint256" },
      { name: "fighterBId", type: "uint256" },
      { name: "rounds", type: "uint8" }
    ], outputs: []
  },
  // scoring variants
  {
    type: "function", name: "scoreRound", stateMutability: "nonpayable",
    inputs: [
      { name: "fightId", type: "uint256" },
      { name: "roundId", type: "uint256" },
      { name: "scoreA", type: "uint8" },
      { name: "scoreB", type: "uint8" }
    ], outputs: []
  },
  {
    type: "function", name: "setRoundScore", stateMutability: "nonpayable",
    inputs: [
      { name: "fightId", type: "uint256" },
      { name: "roundId", type: "uint256" },
      { name: "scoreA", type: "uint8" },
      { name: "scoreB", type: "uint8" }
    ], outputs: []
  },
  {
    type: "function", name: "score", stateMutability: "nonpayable",
    inputs: [
      { name: "fightId", type: "uint256" },
      { name: "roundId", type: "uint256" },
      { name: "scoreA", type: "uint8" },
      { name: "scoreB", type: "uint8" }
    ], outputs: []
  },
  // per-judge winner variants
  { type: "function", name: "getWinner", stateMutability: "view", inputs: [
      { name: "fightId", type: "uint256" }, { name: "judgeId", type: "uint256" }
    ], outputs: [
      { name: "winnerId", type: "uint256" },
      { name: "winnerName", type: "string" },
      { name: "judgeName", type: "string" }
    ]
  },
  { type: "function", name: "judgeWinner", stateMutability: "view", inputs: [
      { name: "fightId", type: "uint256" }, { name: "judgeId", type: "uint256" }
    ], outputs: [
      { name: "winnerId", type: "uint256" },
      { name: "winnerName", type: "string" },
      { name: "judgeName", type: "string" }
    ]
  },
  { type: "function", name: "winnerOf", stateMutability: "view", inputs: [
      { name: "fightId", type: "uint256" }, { name: "judgeId", type: "uint256" }
    ], outputs: [
      { name: "winnerId", type: "uint256" },
      { name: "winnerName", type: "string" },
      { name: "judgeName", type: "string" }
    ]
  },
  // consensus
  { type: "function", name: "JudgingMajority", stateMutability: "view", inputs: [
      { name: "fightId", type: "uint256" }
    ], outputs: [ { name: "winnerId", type: "uint256" } ]
  },
  // ranking apply
  { type: "function", name: "ranking", stateMutability: "nonpayable", inputs: [
      { name: "fightId", type: "uint256" }
    ], outputs: []
  },
  // Some handy public getters many contracts expose
  { type: "function", name: "judges", stateMutability: "view", inputs: [ { name: "id", type: "uint256" } ], outputs: [
      { name: "name", type: "string" },
      { name: "rank", type: "uint256" },
      { name: "rightDecision", type: "uint256" },
      { name: "wrongDecision", type: "uint256" }
    ]
  },
  { type: "function", name: "fighters", stateMutability: "view", inputs: [ { name: "id", type: "uint256" } ], outputs: [
      { name: "name", type: "string" }
    ]
  },
  // Events (optional, if your contracts emit them)
  { type: "event", name: "FightScore", inputs: [
      { name: "fightId", type: "uint256", indexed: true },
      { name: "roundId", type: "uint256", indexed: false },
      { name: "scoreA", type: "uint8", indexed: false },
      { name: "scoreB", type: "uint8", indexed: false },
      { name: "judgeId", type: "uint256", indexed: true }
    ], anonymous: false }
];

function useEthers() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = async () => {
    if (!(window as any).ethereum) throw new Error("No wallet found. Install MetaMask.");
    const p = new ethers.BrowserProvider((window as any).ethereum);
    await p.send("eth_requestAccounts", []);
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
    setAddress(await s.getAddress());
    const net = await p.getNetwork();
    setChainId(Number(net.chainId));
  };

  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on?.("accountsChanged", () => connect());
      (window as any).ethereum.on?.("chainChanged", () => connect());
    }
  }, []);

  return { provider, signer, address, chainId, connect };
}

function useContract(signerOrProvider: ethers.Signer | ethers.Provider | null, address: string, abi: any) {
  return useMemo(() => {
    if (!signerOrProvider || !address) return null;
    try {
      return new ethers.Contract(address, abi, signerOrProvider);
    } catch (e) {
      console.error("Contract init error", e);
      return null;
    }
  }, [signerOrProvider, address, abi]);
}

async function callFirstAvailable(contract: ethers.Contract, names: string[], args: any[] = []) {
  for (const name of names) {
    if (typeof (contract as any)[name] === "function") {
      // try call populated
      try {
        const fn = (contract as any)[name];
        const tx = await fn(...args);
        // detect if view vs tx
        if (tx && typeof tx.wait === "function") {
          const receipt = await tx.wait();
          return receipt;
        }
        return tx; // view result
      } catch (err) {
        // try next option
      }
    }
  }
  throw new Error("None of the candidate function names are available or all calls failed.");
}

export default function App() {
  const { provider, signer, address, chainId, connect } = useEthers();

  const [addr, setAddr] = useState<string>(DEFAULT_ADDRESS);
  const [abiText, setAbiText] = useState<string>(JSON.stringify(HYBRID_ABI, null, 2));
  const parsedAbi = useMemo(() => {
    try { return JSON.parse(abiText); } catch { return HYBRID_ABI; }
  }, [abiText]);

  const rw = useContract(signer ?? null, addr, parsedAbi);
  const ro = useContract(provider ?? null, addr, parsedAbi);

  // form state
  const [judgeName, setJudgeName] = useState("");
  const [fighterName, setFighterName] = useState("");
  const [fightId, setFightId] = useState<string>("0");
  const [rounds, setRounds] = useState<string>("3");
  const [fighterAId, setFighterAId] = useState<string>("0");
  const [fighterBId, setFighterBId] = useState<string>("1");
  const [roundId, setRoundId] = useState<string>("1");
  const [scoreA, setScoreA] = useState<string>("10");
  const [scoreB, setScoreB] = useState<string>("9");
  const [judgeIdQuery, setJudgeIdQuery] = useState<string>("1");

  const [log, setLog] = useState<string>("");
  const pushLog = (m: string) => setLog(prev => `${m}\n${prev}`);

  const ready = signer && rw;

  const doRegisterJudge = async () => {
    if (!ready) return alert("Connect wallet first");
    if (!judgeName) return alert("Enter judge name");
    try {
      await callFirstAvailable(rw!, ["_registerJudge", "registerJudge"], [judgeName]);
      pushLog(`Registered judge: ${judgeName}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doRegisterFighter = async () => {
    if (!ready) return alert("Connect wallet first");
    if (!fighterName) return alert("Enter fighter name");
    try {
      await callFirstAvailable(rw!, ["_registerFighter", "registerFighter"], [fighterName]);
      pushLog(`Registered fighter: ${fighterName}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doCreateMatch = async () => {
    if (!ready) return alert("Connect wallet first");
    try {
      await callFirstAvailable(rw!, ["setMatch"], [BigInt(fighterAId), BigInt(fighterBId), Number(rounds)]);
      pushLog(`Created match A=${fighterAId} vs B=${fighterBId} rounds=${rounds}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doScore = async () => {
    if (!ready) return alert("Connect wallet first");
    try {
      await callFirstAvailable(rw!, ["scoreRound", "setRoundScore", "score"], [
        BigInt(fightId), BigInt(roundId), Number(scoreA), Number(scoreB)
      ]);
      pushLog(`Scored fight ${fightId} round ${roundId}: ${scoreA}-${scoreB}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doJudgeWinner = async () => {
    if (!ro) return alert("Connect wallet first");
    try {
      const res = await callFirstAvailable(ro, ["getWinner", "judgeWinner", "winnerOf"], [
        BigInt(fightId), BigInt(judgeIdQuery)
      ]);
      // view call returns object or array
      const out = res as any;
      const winnerId = Number(out.winnerId ?? out[0]);
      const wName = String(out.winnerName ?? out[1] ?? "?");
      const jName = String(out.judgeName ?? out[2] ?? "?");
      pushLog(`Judge ${judgeIdQuery} (${jName}) winner: ${winnerId} (${wName})`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doMajority = async () => {
    if (!ro) return alert("Connect wallet first");
    try {
      const w = await callFirstAvailable(ro, ["JudgingMajority"], [BigInt(fightId)]);
      const winnerId = Number(w);
      pushLog(`Majority winner for fight ${fightId}: ${winnerId}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doApplyRanking = async () => {
    if (!ready) return alert("Connect wallet first");
    try {
      await callFirstAvailable(rw!, ["ranking"], [BigInt(fightId)]);
      pushLog(`Applied ranking for fight ${fightId}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  const doReadJudge = async () => {
    if (!ro) return alert("Connect wallet first");
    try {
      const j = await (ro as any).judges(BigInt(judgeIdQuery));
      const name = j.name ?? j[0];
      const rank = Number(j.rank ?? j[1] ?? 0n);
      const right = Number(j.rightDecision ?? j[2] ?? 0n);
      const wrong = Number(j.wrongDecision ?? j[3] ?? 0n);
      pushLog(`Judge ${judgeIdQuery}: ${name} | rank=${rank} right=${right} wrong=${wrong}`);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto grid gap-6">
        <motion.h1 layout className="text-2xl font-semibold">Fight Scoring Dapp</motion.h1>

        <section className="grid gap-3 rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={connect}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99]"
            >{address ? `Connected: ${address.slice(0,6)}…${address.slice(-4)}` : "Connect Wallet"}</button>
            <div className="text-sm opacity-80">Chain: {chainId ?? "?"}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span>Contract address</span>
              <input value={addr} onChange={e=>setAddr(e.target.value)} placeholder="0x…" className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
            </label>
            <label className="grid gap-1 text-sm">
              <span>ABI JSON (paste your compiled ABI for JudgeRank)</span>
              <textarea value={abiText} onChange={e=>setAbiText(e.target.value)} rows={6} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700 font-mono" />
            </label>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-4">
            <div className="rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800 grid gap-3">
              <h2 className="font-semibold">Register</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Judge name</span>
                  <input value={judgeName} onChange={e=>setJudgeName(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <button onClick={doRegisterJudge} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 self-end">Register judge</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Fighter name</span>
                  <input value={fighterName} onChange={e=>setFighterName(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <button onClick={doRegisterFighter} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 self-end">Register fighter</button>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800 grid gap-3">
              <h2 className="font-semibold">Create match</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Fighter A id</span>
                  <input value={fighterAId} onChange={e=>setFighterAId(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Fighter B id</span>
                  <input value={fighterBId} onChange={e=>setFighterBId(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Rounds (3 or 5)</span>
                  <input value={rounds} onChange={e=>setRounds(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
              </div>
              <button onClick={doCreateMatch} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 w-fit">Create</button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800 grid gap-3">
              <h2 className="font-semibold">Score a round</h2>
              <div className="grid sm:grid-cols-4 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Fight id</span>
                  <input value={fightId} onChange={e=>setFightId(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Round</span>
                  <input value={roundId} onChange={e=>setRoundId(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Score A</span>
                  <input value={scoreA} onChange={e=>setScoreA(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Score B</span>
                  <input value={scoreB} onChange={e=>setScoreB(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
              </div>
              <button onClick={doScore} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 w-fit">Submit score</button>
            </div>

            <div className="rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800 grid gap-3">
              <h2 className="font-semibold">Results</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="grid gap-1 text-sm">
                  <span>Judge id</span>
                  <input value={judgeIdQuery} onChange={e=>setJudgeIdQuery(e.target.value)} className="px-3 py-2 rounded-xl bg-slate-800 ring-1 ring-slate-700" />
                </label>
                <button onClick={doJudgeWinner} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 self-end">Per-judge winner</button>
                <button onClick={doMajority} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 self-end">Majority winner</button>
              </div>
              <div className="flex gap-3">
                <button onClick={doApplyRanking} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500">Apply ranking</button>
                <button onClick={doReadJudge} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600">Read judge</button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-4 bg-slate-900/60 ring-1 ring-slate-800">
          <h2 className="font-semibold mb-2">Activity</h2>
          <pre className="text-sm whitespace-pre-wrap bg-slate-950/60 rounded-xl p-3 ring-1 ring-slate-800 min-h-[120px]">{log || "No actions yet."}</pre>
        </section>

        <footer className="text-xs opacity-70">Paste your ABI, set the address, connect, then use the forms. If a function name mismatch occurs, update the ABI to your exact contract to avoid fallbacks.</footer>
      </div>
    </div>
  );
}
