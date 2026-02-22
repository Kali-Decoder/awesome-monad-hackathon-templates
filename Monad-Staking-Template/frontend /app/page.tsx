"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { AlertTriangle, ExternalLink, Loader2, Wallet } from "lucide-react";
import { monadTestnet } from "./config/chains";
import {
  ERC20_ABI,
  REWARD_TOKEN_ADDRESS,
  STAKING_ABI,
  STAKING_CONTRACT_ADDRESS,
  STAKING_TOKEN_ADDRESS,
} from "./config/staking_config";
import { useToastContext } from "./contexts/ToastContext";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener: (event: string, cb: (...args: unknown[]) => void) => void;
};

type ContractStats = {
  owner: string;
  duration: bigint;
  finishAt: bigint;
  rewardRate: bigint;
  totalSupply: bigint;
  rewardPerToken: bigint;
};

type UserStats = {
  staked: bigint;
  earned: bigint;
  rewards: bigint;
  stakingWalletBalance: bigint;
  rewardWalletBalance: bigint;
};

const ZERO = BigInt(0);

const EMPTY_CONTRACT_STATS: ContractStats = {
  owner: "",
  duration: ZERO,
  finishAt: ZERO,
  rewardRate: ZERO,
  totalSupply: ZERO,
  rewardPerToken: ZERO,
};

const EMPTY_USER_STATS: UserStats = {
  staked: ZERO,
  earned: ZERO,
  rewards: ZERO,
  stakingWalletBalance: ZERO,
  rewardWalletBalance: ZERO,
};

const shortAddress = (value: string) => {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const formatToken = (value: bigint, decimals: number, digits = 4) => {
  try {
    const parsed = Number(ethers.formatUnits(value, decimals));
    if (!Number.isFinite(parsed)) return "0";
    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  } catch {
    return "0";
  }
};

const formatDateTime = (seconds: bigint) => {
  if (seconds <= BigInt(0)) return "-";
  return new Date(Number(seconds) * 1000).toLocaleString();
};

export default function Home() {
  const { showError, showInfo, showSuccess } = useToastContext();

  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const [contractStats, setContractStats] = useState<ContractStats>(EMPTY_CONTRACT_STATS);
  const [userStats, setUserStats] = useState<UserStats>(EMPTY_USER_STATS);

  const [stakingSymbol, setStakingSymbol] = useState("STK");
  const [rewardSymbol, setRewardSymbol] = useState("RWD");
  const [stakingDecimals, setStakingDecimals] = useState(18);
  const [rewardDecimals, setRewardDecimals] = useState(18);

  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("604800");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ethereum =
    typeof window !== "undefined" ? ((window as Window & { ethereum?: Eip1193Provider }).ethereum ?? null) : null;

  const isCorrectNetwork = chainId === monadTestnet.id;
  const isOwner =
    !!account &&
    !!contractStats.owner &&
    account.toLowerCase() === contractStats.owner.toLowerCase();

  const explorerBase = monadTestnet.blockExplorers?.default.url ?? "https://testnet.monadvision.com";

  const connectWallet = useCallback(async () => {
    if (!ethereum) {
      showError("Install MetaMask or another EVM wallet.");
      return;
    }

    try {
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection failed.";
      showError(message);
    }
  }, [ethereum, showError]);

  const switchToMonad = useCallback(async () => {
    if (!ethereum) {
      showError("Wallet provider not available.");
      return;
    }

    const chainHex = `0x${monadTestnet.id.toString(16)}`;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainHex }],
      });
    } catch (switchError) {
      const err = switchError as { code?: number };
      if (err.code !== 4902) {
        const message = switchError instanceof Error ? switchError.message : "Network switch failed.";
        showError(message);
        return;
      }

      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainHex,
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: monadTestnet.rpcUrls.default.http,
            blockExplorerUrls: [explorerBase],
          },
        ],
      });
    }
  }, [ethereum, explorerBase, showError]);

  const loadWalletState = useCallback(async () => {
    if (!ethereum) return;

    try {
      const accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
      const chainHex = (await ethereum.request({ method: "eth_chainId" })) as string;
      setChainId(Number.parseInt(chainHex, 16));

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      } else {
        setAccount("");
        setIsConnected(false);
      }
    } catch {
      showError("Unable to read wallet state.");
    }
  }, [ethereum, showError]);

  const refreshAll = useCallback(async () => {
    if (!ethereum) return;

    setIsRefreshing(true);
    try {
      const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
      const stakingToken = new ethers.Contract(STAKING_TOKEN_ADDRESS, ERC20_ABI, provider);
      const rewardToken = new ethers.Contract(REWARD_TOKEN_ADDRESS, ERC20_ABI, provider);

      const [owner, duration, finishAt, rewardRate, totalSupply, rewardPerToken, stakeTokenSymbol, rewardTokenSymbol, stakeTokenDecimals, rewardTokenDecimals] = await Promise.all([
        staking.owner() as Promise<string>,
        staking.duration() as Promise<bigint>,
        staking.finishAt() as Promise<bigint>,
        staking.rewardRate() as Promise<bigint>,
        staking.totalSupply() as Promise<bigint>,
        staking.rewardPerToken() as Promise<bigint>,
        stakingToken.symbol() as Promise<string>,
        rewardToken.symbol() as Promise<string>,
        stakingToken.decimals() as Promise<number>,
        rewardToken.decimals() as Promise<number>,
      ]);

      setContractStats({ owner, duration, finishAt, rewardRate, totalSupply, rewardPerToken });
      setStakingSymbol(stakeTokenSymbol);
      setRewardSymbol(rewardTokenSymbol);
      setStakingDecimals(Number(stakeTokenDecimals));
      setRewardDecimals(Number(rewardTokenDecimals));

      if (account) {
        const [staked, earned, rewards, stakeWalletBal, rewardWalletBal] = await Promise.all([
          staking.balanceOf(account) as Promise<bigint>,
          staking.earned(account) as Promise<bigint>,
          staking.rewards(account) as Promise<bigint>,
          stakingToken.balanceOf(account) as Promise<bigint>,
          rewardToken.balanceOf(account) as Promise<bigint>,
        ]);

        setUserStats({
          staked,
          earned,
          rewards,
          stakingWalletBalance: stakeWalletBal,
          rewardWalletBalance: rewardWalletBal,
        });
      } else {
        setUserStats(EMPTY_USER_STATS);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch contract data.";
      showError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [account, ethereum, showError]);

  useEffect(() => {
    loadWalletState();
  }, [loadWalletState]);

  useEffect(() => {
    if (!ethereum) return;

    const onAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? (accounts as string[]) : [];
      if (list.length > 0) {
        setAccount(list[0]);
        setIsConnected(true);
      } else {
        setAccount("");
        setIsConnected(false);
      }
    };

    const onChainChanged = (value: unknown) => {
      const chainHex = typeof value === "string" ? value : "0x0";
      setChainId(Number.parseInt(chainHex, 16));
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", onAccountsChanged);
      ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [ethereum]);

  useEffect(() => {
    if (!ethereum) return;
    refreshAll();
    const timer = setInterval(() => {
      refreshAll();
    }, 12000);
    return () => clearInterval(timer);
  }, [ethereum, refreshAll]);

  const runWrite = useCallback(
    async (fn: (signer: ethers.Signer) => Promise<void>, successText: string) => {
      if (!ethereum) {
        showError("Wallet provider not available.");
        return;
      }
      if (!account) {
        showInfo("Connect wallet first.");
        return;
      }
      if (!isCorrectNetwork) {
        showWarningNetwork();
        return;
      }

      setIsSubmitting(true);
      try {
        const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
        const signer = await provider.getSigner();
        await fn(signer);
        showSuccess(successText);
        await refreshAll();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Transaction failed.";
        showError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [account, ethereum, isCorrectNetwork, refreshAll, showError, showInfo, showSuccess]
  );

  const showWarningNetwork = () => {
    showError(`Switch wallet network to ${monadTestnet.name} (${monadTestnet.id}).`);
  };

  const stake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      showInfo("Enter a valid stake amount.");
      return;
    }

    await runWrite(async (signer) => {
      const amount = ethers.parseUnits(stakeAmount, stakingDecimals);
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const stakingToken = new ethers.Contract(STAKING_TOKEN_ADDRESS, ERC20_ABI, signer);

      const allowance = (await stakingToken.allowance(account, STAKING_CONTRACT_ADDRESS)) as bigint;
      if (allowance < amount) {
        const approveTx = await stakingToken.approve(STAKING_CONTRACT_ADDRESS, amount);
        await approveTx.wait();
      }

      const tx = await staking.stake(amount);
      await tx.wait();
      setStakeAmount("");
    }, "Stake successful.");
  };

  const withdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      showInfo("Enter a valid withdraw amount.");
      return;
    }

    await runWrite(async (signer) => {
      const amount = ethers.parseUnits(withdrawAmount, stakingDecimals);
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.withdraw(amount);
      await tx.wait();
      setWithdrawAmount("");
    }, "Withdraw successful.");
  };

  const claimReward = async () => {
    await runWrite(async (signer) => {
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.getReward();
      await tx.wait();
    }, "Rewards claimed.");
  };

  const setRewardsDuration = async () => {
    if (!durationSeconds || Number(durationSeconds) <= 0) {
      showInfo("Enter a valid duration in seconds.");
      return;
    }

    await runWrite(async (signer) => {
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.setRewardsDuration(BigInt(durationSeconds));
      await tx.wait();
    }, "Reward duration updated.");
  };

  const fundRewards = async () => {
    if (!rewardAmount || Number(rewardAmount) <= 0) {
      showInfo("Enter a valid reward amount.");
      return;
    }

    await runWrite(async (signer) => {
      const amount = ethers.parseUnits(rewardAmount, rewardDecimals);
      const rewardToken = new ethers.Contract(REWARD_TOKEN_ADDRESS, ERC20_ABI, signer);
      const tx = await rewardToken.transfer(STAKING_CONTRACT_ADDRESS, amount);
      await tx.wait();
    }, "Rewards funded to staking contract.");
  };

  const notifyRewardAmount = async () => {
    if (!rewardAmount || Number(rewardAmount) <= 0) {
      showInfo("Enter a valid reward amount.");
      return;
    }

    await runWrite(async (signer) => {
      const amount = ethers.parseUnits(rewardAmount, rewardDecimals);
      const staking = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.notifyRewardAmount(amount);
      await tx.wait();
      setRewardAmount("");
    }, "Reward amount notified.");
  };

  const rewardRateDisplay = useMemo(() => {
    return formatToken(contractStats.rewardRate, rewardDecimals, 8);
  }, [contractStats.rewardRate, rewardDecimals]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="rounded-2xl border border-card-border bg-card/80 p-6 shadow-2xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Demo Staking Contract Client</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Monad Testnet Staking Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Contract: {shortAddress(STAKING_CONTRACT_ADDRESS)}
              <a
                href={`${explorerBase}/address/${STAKING_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-monad-purple hover:text-white"
              >
                Explorer <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isConnected ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {shortAddress(account)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="inline-flex items-center gap-2 rounded-lg bg-monad-purple px-4 py-2 text-sm font-semibold text-white hover:bg-monad-purple/80"
              >
                <Wallet className="h-4 w-4" /> Connect Wallet
              </button>
            )}

            {!isCorrectNetwork && (
              <button
                onClick={switchToMonad}
                className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/20"
              >
                <AlertTriangle className="h-4 w-4" /> Switch to Monad Testnet
              </button>
            )}

            <button
              onClick={refreshAll}
              disabled={isRefreshing}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Staked" value={`${formatToken(contractStats.totalSupply, stakingDecimals)} ${stakingSymbol}`} />
        <StatCard label="Reward Rate (per sec)" value={`${rewardRateDisplay} ${rewardSymbol}`} />
        <StatCard label="Duration" value={`${contractStats.duration.toString()} sec`} />
        <StatCard label="Finish At" value={formatDateTime(contractStats.finishAt)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-card-border bg-card/80 p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">User Actions</h2>
          <p className="mt-1 text-xs text-zinc-400">Approve and stake {stakingSymbol}, withdraw stake, and claim rewards.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ActionInput
              label={`Stake Amount (${stakingSymbol})`}
              value={stakeAmount}
              onChange={setStakeAmount}
              buttonLabel="Approve + Stake"
              onSubmit={stake}
              disabled={isSubmitting || !isConnected || !isCorrectNetwork}
            />

            <ActionInput
              label={`Withdraw Amount (${stakingSymbol})`}
              value={withdrawAmount}
              onChange={setWithdrawAmount}
              buttonLabel="Withdraw"
              onSubmit={withdraw}
              disabled={isSubmitting || !isConnected || !isCorrectNetwork}
            />
          </div>

          <div className="mt-4">
            <button
              onClick={claimReward}
              disabled={isSubmitting || !isConnected || !isCorrectNetwork}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Rewards"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-card-border bg-card/80 p-5">
          <h2 className="text-lg font-semibold text-white">Your Position</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <DataRow label={`Wallet ${stakingSymbol}`} value={formatToken(userStats.stakingWalletBalance, stakingDecimals)} />
            <DataRow label="Staked" value={formatToken(userStats.staked, stakingDecimals)} />
            <DataRow label="Earned" value={formatToken(userStats.earned, rewardDecimals)} />
            <DataRow label="Rewards Mapping" value={formatToken(userStats.rewards, rewardDecimals)} />
            <DataRow label={`Wallet ${rewardSymbol}`} value={formatToken(userStats.rewardWalletBalance, rewardDecimals)} />
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-card-border bg-card/80 p-5">
        <h2 className="text-lg font-semibold text-white">Contract Info</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <DataRow label="Owner" value={shortAddress(contractStats.owner)} mono />
          <DataRow label="Reward Per Token" value={formatToken(contractStats.rewardPerToken, rewardDecimals, 8)} />
          <DataRow label="Staking Token" value={shortAddress(STAKING_TOKEN_ADDRESS)} mono />
          <DataRow label="Reward Token" value={shortAddress(REWARD_TOKEN_ADDRESS)} mono />
        </dl>
      </section>

      {isOwner && (
        <section className="mt-6 rounded-2xl border border-monad-purple/35 bg-monad-purple/5 p-5">
          <h2 className="text-lg font-semibold text-white">Owner Controls</h2>
          <p className="mt-1 text-xs text-zinc-300">1) Set duration after previous period ends. 2) Fund contract with reward token. 3) Notify reward amount.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ActionInput
              label="Rewards Duration (seconds)"
              value={durationSeconds}
              onChange={setDurationSeconds}
              buttonLabel="Set Duration"
              onSubmit={setRewardsDuration}
              disabled={isSubmitting}
            />

            <ActionInput
              label={`Fund Rewards (${rewardSymbol})`}
              value={rewardAmount}
              onChange={setRewardAmount}
              buttonLabel="Transfer To Contract"
              onSubmit={fundRewards}
              disabled={isSubmitting}
            />

            <div className="rounded-lg border border-monad-purple/35 bg-black/35 p-3">
              <p className="text-xs text-zinc-300">Notify the newly funded amount to start or refresh emissions.</p>
              <button
                onClick={notifyRewardAmount}
                disabled={isSubmitting}
                className="mt-3 w-full rounded-lg bg-monad-purple px-4 py-2 text-sm font-semibold text-white hover:bg-monad-purple/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Notify Reward Amount
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function DataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-black/35 px-3 py-2">
      <dt className="text-zinc-400">{label}</dt>
      <dd className={`${mono ? "font-mono" : ""} text-right text-white`}>{value}</dd>
    </div>
  );
}

function ActionInput({
  label,
  value,
  onChange,
  buttonLabel,
  onSubmit,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  buttonLabel: string;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-black/35 p-3">
      <label className="text-xs text-zinc-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.0"
        className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-monad-purple"
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="mt-3 w-full rounded-lg bg-monad-purple px-4 py-2 text-sm font-semibold text-white hover:bg-monad-purple/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
