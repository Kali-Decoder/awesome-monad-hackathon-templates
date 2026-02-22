"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { ethers } from "ethers";
import AnimatedNumbers from "react-animated-numbers";
import Image from "next/image";

type LeaderboardEntry = {
  walletAddress: string;
  totalWonWei: string;
  totalClaimedWei: string;
  scratchCount: number;
  txCount: number;
  lastActivity: string;
};

const formatEth = (value: bigint, digits = 4) => {
  const eth = Number(ethers.formatEther(value));
  if (!Number.isFinite(eth)) return "0";
  return eth.toFixed(digits);
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/leaderboard?limit=50", { cache: "no-store" });
      if (!response.ok) return;
      const json = await response.json();
      if (json?.ok && Array.isArray(json.leaderboard)) {
        setLeaderboard(json.leaderboard as LeaderboardEntry[]);
      }
    } catch (error) {
      console.warn("Leaderboard fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <Image
          src="/scratch-win-sticker.svg"
          alt="Scratch & Win"
          width={160}
          height={68}
          className="pointer-events-none absolute -z-50 left-2 top-8 hidden -rotate-12 opacity-70 lg:block"
        />
        <Image
          src="/scratch-win-sticker.svg"
          alt="Scratch & Win"
          width={160}
          height={68}
          className="pointer-events-none absolute -z-50 right-2 top-20 hidden rotate-9 opacity-70 lg:block"
        />
        <Image
          src="/scratch-win-sticker.svg"
          alt="Scratch & Win"
          width={160}
          height={68}
          className="pointer-events-none absolute -z-50 bottom-10 left-8 hidden rotate-6 opacity-70 lg:block"
        />
        <Image
          src="/scratch-win-sticker.svg"
          alt="Scratch & Win"
          width={160}
          height={68}
          className="pointer-events-none absolute -z-50 bottom-14 right-4 hidden -rotate-10 opacity-70 lg:block"
        />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-monad-purple to-purple-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-2 text-sm text-gray-400">Top tracked wallets on Monad Testnet</p>
            <div className="mt-3">
              <Image
                src="/scratch-win-sticker.svg"
                alt="Scratch & Win"
                width={170}
                height={72}
                className="w-[110px] sm:w-[140px] md:w-[165px]"
              />
            </div>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="rounded-lg bg-monad-purple/10 p-2 text-monad-purple transition-colors hover:bg-monad-purple/20"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-card-border bg-card p-4">
          <Link href="/" className="text-sm text-monad-purple hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-card p-6 text-sm text-gray-400">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto rounded-xl border border-card-border bg-card">
            <table className="min-w-full text-left">
              <thead className="border-b border-card-border bg-black/40">
                <tr className="text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Player</th>
                  <th className="px-5 py-4">Total Won</th>
                  <th className="px-5 py-4">Total Claimed</th>
                  <th className="px-5 py-4">Scratches</th>
                  <th className="px-5 py-4">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const shortAddress = `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`;
                  return (
                    <tr
                      key={`${entry.walletAddress}-${index}`}
                      className="border-b border-card-border/70 text-sm last:border-b-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4 text-xl font-bold text-white">#{index + 1}</td>
                      <td className="px-5 py-4 text-lg font-semibold">
                        <Link href={`/profile/${entry.walletAddress}`} className="text-monad-purple hover:underline">
                          {shortAddress}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-end gap-2">
                          <AnimatedNumbers
                            animateToNumber={Number(formatEth(BigInt(entry.totalWonWei)))}
                            includeComma
                            transitions={(i) => ({
                              type: "spring",
                              duration: i + 0.3,
                            })}
                            fontStyle={{
                              fontSize: 24,
                              fontWeight: 700,
                              color: "rgb(255,255,255)",
                            }}
                          />
                          <span className="mb-1 text-sm text-gray-300">MON</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-end gap-2">
                          <AnimatedNumbers
                            animateToNumber={Number(formatEth(BigInt(entry.totalClaimedWei)))}
                            includeComma
                            transitions={(i) => ({
                              type: "spring",
                              duration: i + 0.3,
                            })}
                            fontStyle={{
                              fontSize: 24,
                              fontWeight: 700,
                              color: "rgb(255,255,255)",
                            }}
                          />
                          <span className="mb-1 text-sm text-gray-300">MON</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <AnimatedNumbers
                          animateToNumber={entry.scratchCount}
                          includeComma
                          transitions={(i) => ({
                            type: "spring",
                            duration: i + 0.3,
                          })}
                          fontStyle={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "rgb(255,255,255)",
                          }}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <AnimatedNumbers
                          animateToNumber={entry.txCount}
                          includeComma
                          transitions={(i) => ({
                            type: "spring",
                            duration: i + 0.3,
                          })}
                          fontStyle={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "rgb(255,255,255)",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
