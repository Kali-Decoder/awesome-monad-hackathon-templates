"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import AnimatedNumbers from "react-animated-numbers";
import { RefreshCw } from "lucide-react";
import { monadTestnet } from "@/app/config/chains";
import { SCRATCH_CARD_ABI, SCRATCH_CARD_ADDRESS } from "@/app/config/scratch_game_config";

type ProfileSummary = {
  walletAddress: string;
  totalWonWei: string;
  totalClaimedWei: string;
  scratchCount: number;
  claimCount: number;
  txCount: number;
  lastActivity: string | null;
};

type ProfileTx = {
  walletAddress: string;
  txHash: string;
  action: "scratch_reward" | "claim";
  amountWei: string;
  occurredAt: string;
};

type OnchainStats = {
  pending: bigint;
  claimed: bigint;
  totalWon: bigint;
  scratches: bigint;
};

const EMPTY_ONCHAIN: OnchainStats = {
  pending: BigInt(0),
  claimed: BigInt(0),
  totalWon: BigInt(0),
  scratches: BigInt(0),
};

const formatEth = (value: bigint, digits = 4) => {
  const eth = Number(ethers.formatEther(value));
  if (!Number.isFinite(eth)) return "0";
  return eth.toFixed(digits);
};

export default function ProfilePage() {
  const params = useParams<{ address: string }>();
  const address = useMemo(() => String(params?.address || "").toLowerCase(), [params]);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [transactions, setTransactions] = useState<ProfileTx[]>([]);
  const [onchain, setOnchain] = useState<OnchainStats>(EMPTY_ONCHAIN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!address) return;
    try {
      setIsLoading(true);
      setError(null);

      const [apiResponse, onchainData] = await Promise.all([
        fetch(`/api/profile/${address}`, { cache: "no-store" }),
        (async () => {
          const provider = new ethers.JsonRpcProvider(monadTestnet.rpcUrls.default.http[0]);
          const contract = new ethers.Contract(SCRATCH_CARD_ADDRESS, SCRATCH_CARD_ABI, provider);
          const playerStats = await contract.getPlayerStats(address);
          return {
            pending: BigInt(playerStats[0]),
            claimed: BigInt(playerStats[1]),
            totalWon: BigInt(playerStats[2]),
            scratches: BigInt(playerStats[3]),
          } as OnchainStats;
        })(),
      ]);

      if (!apiResponse.ok) {
        throw new Error("Failed to load profile");
      }

      const json = await apiResponse.json();
      if (!json?.ok) {
        throw new Error(json?.error || "Failed to load profile data");
      }

      setSummary(json.summary as ProfileSummary);
      setTransactions((json.transactions || []) as ProfileTx[]);
      setOnchain(onchainData);
    } catch (err: any) {
      setError(err?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Player Profile
            </h1>
            <p className="mt-2 break-all text-sm text-gray-400">{address}</p>
          </div>
          <button
            onClick={refresh}
            className="rounded-lg bg-monad-purple/10 p-2 text-monad-purple transition-colors hover:bg-monad-purple/20"
            title="Refresh profile"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-card-border bg-card p-4">
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-monad-purple hover:underline">
              ← Back to Game
            </Link>
            <Link href="/leaderboard" className="text-monad-purple hover:underline">
              Back to Leaderboard
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Onchain Pending" value={onchain.pending} suffix=" MON" asEth />
          <StatCard label="Onchain Claimed" value={onchain.claimed} suffix=" MON" asEth />
          <StatCard label="Onchain Total Won" value={onchain.totalWon} suffix=" MON" asEth />
          <StatCard label="Onchain Scratches" value={onchain.scratches} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Tracked Won" value={BigInt(summary?.totalWonWei || "0")} suffix=" MON" asEth />
          <StatCard label="Tracked Claimed" value={BigInt(summary?.totalClaimedWei || "0")} suffix=" MON" asEth />
          <StatCard label="Claim Txs" value={BigInt(summary?.claimCount || 0)} />
          <StatCard label="All Txs" value={BigInt(summary?.txCount || 0)} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="min-w-full text-left">
            <thead className="border-b border-card-border bg-black/40">
              <tr className="text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-sm text-gray-400" colSpan={4}>
                    No tracked transactions for this address yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.txHash} className="border-b border-card-border/70 text-sm last:border-b-0">
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          tx.action === "claim"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-monad-purple/15 text-monad-purple"
                        }`}
                      >
                        {tx.action === "claim" ? "Claim" : "Scratch Reward"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{formatEth(BigInt(tx.amountWei))} MON</td>
                    <td className="px-5 py-4 text-gray-300">
                      {tx.occurredAt ? new Date(tx.occurredAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`https://testnet.monadvision.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-monad-purple hover:underline"
                      >
                        {tx.txHash.slice(0, 12)}...{tx.txHash.slice(-8)}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  asEth = false,
}: {
  label: string;
  value: bigint;
  suffix?: string;
  asEth?: boolean;
}) {
  const displayValue = asEth ? Number(formatEth(value)) : Number(value);

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <div className="flex items-end gap-2">
        <AnimatedNumbers
          animateToNumber={Number.isFinite(displayValue) ? displayValue : 0}
          includeComma
          transitions={(index) => ({
            type: "spring",
            duration: index + 0.3,
          })}
          fontStyle={{
            fontSize: 26,
            fontWeight: 700,
            color: "rgb(255,255,255)",
          }}
        />
        {suffix ? <span className="mb-1 text-sm text-gray-300">{suffix}</span> : null}
      </div>
    </div>
  );
}
