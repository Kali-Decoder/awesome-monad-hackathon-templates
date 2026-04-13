"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { ABI, ContractAddressDice, MonadEntropyAddress } from "@/config/contract";

const MONAD_TESTNET_CHAIN_ID = 10143;
const MONAD_TESTNET_EXPLORER_TX_URL = "https://testnet.monadexplorer.com/tx/";
const ROLL_HISTORY_STORAGE_KEY = "monad-dice-roll-history";

type RollHistoryItem = {
  address: string;
  result: number;
  timestamp: number;
  txHash: string;
  resolveSeconds: number;
};
const entropyAbi = [
  {
    inputs: [],
    name: "getFeeV2",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

function WalletStatus() {
  const { address, chain, isConnecting, isDisconnected, isConnected } =
    useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: MONAD_TESTNET_CHAIN_ID,
    query: {
      enabled: Boolean(address) && isConnected,
    },
  });

  if (isConnecting) return <div className="text-xs">Connecting...</div>;
  if (isDisconnected || !isConnected || !address) {
    return <div className="text-xs">Disconnected</div>;
  }

  const isWrongNetwork = chain?.id !== MONAD_TESTNET_CHAIN_ID;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-4">
      <div className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
        <span className="font-medium">Wallet:</span>{" "}
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </div>
      <div className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
        <span className="font-medium">Network:</span>{" "}
        {chain ? `${chain.name} (${chain.id})` : "Unknown"}
      </div>
      <div className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
        <span className="font-medium">Balance:</span>{" "}
        {isBalanceLoading
          ? "Loading..."
          : balance
            ? `${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
            : "Unavailable"}
      </div>
      {isWrongNetwork ? (
        <button
          type="button"
          onClick={() => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })}
          disabled={isSwitchingChain}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSwitchingChain ? "Switching..." : "Switch to Monad Testnet"}
        </button>
      ) : (
        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Connected to Monad Testnet
        </div>
      )}
    </div>
  );
}

const faceTransforms: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateY(-90deg)",
  3: "rotateX(-90deg)",
  4: "rotateX(90deg)",
  5: "rotateY(90deg)",
  6: "rotateX(180deg)",
};

function Dice3D() {
  const [face, setFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [status, setStatus] = useState("Ready to roll on-chain");
  const [isWaitingCallback, setIsWaitingCallback] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);
  const [requestStartMs, setRequestStartMs] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { data: entropyFee } = useReadContract({
    address: MonadEntropyAddress as `0x${string}`,
    abi: entropyAbi,
    functionName: "getFeeV2",
    query: {
      refetchInterval: 15_000,
    },
  });
  const { isLoading: isConfirmingTx, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
    hash: lastTxHash as `0x${string}` | undefined,
    query: {
      enabled: Boolean(lastTxHash),
    },
  });

  const transform = useMemo(() => faceTransforms[face], [face]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ROLL_HISTORY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RollHistoryItem[];
      if (Array.isArray(parsed)) {
        setRollHistory(parsed);
      }
    } catch {
      setRollHistory([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      ROLL_HISTORY_STORAGE_KEY,
      JSON.stringify(rollHistory),
    );
  }, [rollHistory]);

  useEffect(() => {
    if (isTxConfirmed) {
      setIsWaitingCallback(true);
      setStatus("Confirmed. Waiting for VRF callback...");
    }
  }, [isTxConfirmed]);

  useEffect(() => {
    if (!requestStartMs || !isRolling) return;
    const interval = window.setInterval(() => {
      const secs = Math.max(0, Math.floor((Date.now() - requestStartMs) / 1000));
      setElapsedSeconds(secs);
    }, 250);

    return () => window.clearInterval(interval);
  }, [requestStartMs, isRolling]);

  useWatchContractEvent({
    address: ContractAddressDice as `0x${string}`,
    abi: ABI,
    eventName: "DiceRolled",
    onLogs(logs) {
      if (!isWaitingCallback || !address) return;
      for (const log of logs) {
        const typedLog = log as { args?: { player?: string; result?: bigint } };
        const player = typedLog.args?.player;
        const result = typedLog.args?.result;
        if (
          player &&
          result &&
          player.toLowerCase() === address.toLowerCase() &&
          result >= BigInt(1) &&
          result <= BigInt(6)
        ) {
          const rolledNumber = Number(result);
          setFace(rolledNumber);
          setIsRolling(false);
          setIsWaitingCallback(false);
          const resolveSecs = requestStartMs
            ? Math.max(0, Math.floor((Date.now() - requestStartMs) / 1000))
            : elapsedSeconds;
          setElapsedSeconds(resolveSecs);
          setStatus(
            `Result received on-chain: ${result.toString()} in ${resolveSecs}s`,
          );
          setRollHistory((prev) => [
            {
              address: player,
              result: rolledNumber,
              timestamp: Date.now(),
              txHash: pendingTxHash ?? lastTxHash ?? "N/A",
              resolveSeconds: resolveSecs,
            },
            ...prev,
          ].slice(0, 50));
          setPendingTxHash(null);
          setLastTxHash(null);
          setRequestStartMs(null);
        }
      }
    },
  });

  const rollDice = async () => {
    if (isRolling || isWritePending || isConfirmingTx || isWaitingCallback) return;
    if (!isConnected || !address) {
      setStatus("Connect your wallet first");
      return;
    }
    if (chain?.id !== MONAD_TESTNET_CHAIN_ID) {
      setStatus("Switching to Monad testnet...");
      switchChain({ chainId: MONAD_TESTNET_CHAIN_ID });
      return;
    }
    if (!entropyFee || entropyFee <= BigInt(0)) {
      setStatus("Unable to fetch entropy fee");
      return;
    }

    try {
      setIsRolling(true);
      setStatus("Sending roll transaction...");
      const txHash = await writeContractAsync({
        address: ContractAddressDice as `0x${string}`,
        abi: ABI,
        functionName: "rollDice",
        value: entropyFee,
      });
      setRequestStartMs(Date.now());
      setElapsedSeconds(0);
      setPendingTxHash(txHash);
      setLastTxHash(txHash);
      setStatus("Transaction sent. Waiting for confirmation...");
    } catch {
      setIsRolling(false);
      setIsWaitingCallback(false);
      setRequestStartMs(null);
      setElapsedSeconds(0);
      setStatus("Transaction rejected or failed");
    }
  };

  return (
    <div className="flex w-full max-w-7xl flex-1 gap-6 py-6">
      {isRolling ? (
        <div className="fixed right-6 top-20 z-20 rounded-xl border border-zinc-200 bg-white/95 px-5 py-3 text-right shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Waiting Time
          </div>
          <div className="text-4xl font-bold leading-none text-violet-600 dark:text-violet-400">
            {elapsedSeconds}s
          </div>
        </div>
      ) : null}
      <aside className="hidden w-96 shrink-0 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div className="mb-3 text-sm font-semibold">Roll History</div>
        {rollHistory.length === 0 ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            No rolls yet.
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold">No.</th>
                  <th className="px-2 py-2 text-left font-semibold">Address</th>
                  <th className="px-2 py-2 text-left font-semibold">Time</th>
                  <th className="px-2 py-2 text-left font-semibold">Latency</th>
                  <th className="px-2 py-2 text-left font-semibold">Tx</th>
                </tr>
              </thead>
              <tbody>
                {rollHistory.map((item, index) => (
                  <tr
                    key={`${item.timestamp}-${item.address}-${index}`}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-2 py-2">{item.result}</td>
                    <td className="px-2 py-2">
                      {`${item.address.slice(0, 6)}...${item.address.slice(-4)}`}
                    </td>
                    <td className="px-2 py-2">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-2 py-2">{item.resolveSeconds}s</td>
                    <td className="px-2 py-2">
                      {item.txHash !== "N/A" ? (
                        <a
                          href={`${MONAD_TESTNET_EXPLORER_TX_URL}${item.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-violet-600 hover:underline dark:text-violet-400"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="dice-scene">
          <div
            className={`dice ${isRolling ? "rolling" : ""}`}
            style={!isRolling ? { transform } : undefined}
            onClick={rollDice}
            role="button"
            aria-label="Roll dice on-chain"
            aria-disabled={
              isRolling || isWritePending || isConfirmingTx || isWaitingCallback
            }
          >
            <div className="dice-face front">1</div>
            <div className="dice-face back">6</div>
            <div className="dice-face right">2</div>
            <div className="dice-face left">5</div>
            <div className="dice-face top">3</div>
            <div className="dice-face bottom">4</div>
          </div>
        </div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          Last roll: <span className="font-semibold">{face}</span>
        </div>
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Entropy fee: {entropyFee ? `${formatEther(entropyFee)} MON` : "Loading..."}
        </div>
        {isRolling ? (
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Waiting time: {elapsedSeconds}s
          </div>
        ) : null}
        <div className="text-xs text-zinc-600 dark:text-zinc-400">{status}</div>
        <button
          type="button"
          onClick={rollDice}
          disabled={isRolling || isWritePending || isConfirmingTx || isWaitingCallback}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {isWritePending || isConfirmingTx || isWaitingCallback || isRolling
            ? "Rolling..."
            : "Roll Dice (On-chain)"}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <nav className="w-full border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Monad Testnet Dice Roll
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <WalletStatus />
            <div className="self-start sm:self-auto">
              <ConnectKitButton showBalance />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="max-w-lg text-zinc-600 dark:text-zinc-400">
          Roll the 3D dice. Keep your wallet connected on Monad testnet.
        </p>
        <Dice3D />
      </main>
    </div>
  );
}
