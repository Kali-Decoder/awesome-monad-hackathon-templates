"use client";

import React from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { encodeFunctionData, type Abi, type Address } from "viem";
import ABI from "@/lib/contract/abi.json";
import { CONTRACT_ADDRESSES } from "@/config/chains";
import { publicClient } from "@/lib/viem";

const MONAD_CHAIN_HEX = "0x279f";
const COUNTER_ABI = ABI as Abi;

function decodeContractError(error: unknown): string {
  const message = String((error as { message?: string })?.message ?? error ?? "");
  if (message.includes("user rejected") || message.includes("User rejected")) {
    return "Transaction was cancelled.";
  }
  if (message.includes("insufficient funds")) {
    return "Insufficient MON for gas.";
  }
  if (message.includes("execution reverted")) {
    return "Transaction reverted by contract.";
  }
  return "Transaction failed. Please try again.";
}

async function ensureMonadChain(provider: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_CHAIN_HEX }],
    });
  } catch (switchError) {
    const code = (switchError as { code?: number })?.code;
    if (code !== 4902) throw switchError;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: MONAD_CHAIN_HEX,
          chainName: "Monad Testnet",
          nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
          rpcUrls: ["https://testnet-rpc.monad.xyz"],
          blockExplorerUrls: ["https://testnet.monadvision.com"],
        },
      ],
    });
  }
}

export function useCounterContract() {
  const { address } = useAccount();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const contractAddress = CONTRACT_ADDRESSES.counter;

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
  const embeddedAddress = embeddedWallet?.address as Address | undefined;
  const connectedAddress = (embeddedAddress || address) as Address | undefined;

  const [isPending, setIsPending] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!embeddedWallet || address === embeddedAddress) return;
    setActiveWallet(embeddedWallet).catch(() => {
      // no-op: wallet can already be active
    });
  }, [embeddedWallet, address, embeddedAddress, setActiveWallet]);

  const contracts: any[] = [
    {
      address: contractAddress,
      abi: COUNTER_ABI,
      functionName: "totalCount",
    },
    ...(connectedAddress
      ? [
          {
            address: contractAddress,
            abi: COUNTER_ABI,
            functionName: "getMyCount",
            account: connectedAddress,
          },
          {
            address: contractAddress,
            abi: COUNTER_ABI,
            functionName: "getCount",
            args: [connectedAddress],
          },
        ]
      : []),
  ];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
  });

  const totalCount = (data?.[0]?.result as bigint | undefined) ?? 0n;
  const myCount = (data?.[1]?.result as bigint | undefined) ?? 0n;
  const directCount = (data?.[2]?.result as bigint | undefined) ?? 0n;

  const increaseCounter = React.useCallback(async () => {
    if (!embeddedWallet || !embeddedAddress) {
      throw new Error("Wallet not connected.");
    }

    setIsPending(true);
    setActionError(null);

    try {
      const provider = await embeddedWallet.getEthereumProvider();
      await ensureMonadChain(provider);

      const txData = encodeFunctionData({
        abi: COUNTER_ABI,
        functionName: "increaseCounter",
      });

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: embeddedAddress,
            to: contractAddress,
            data: txData,
            value: "0x0",
          },
        ],
      });

      const hash = txHash as `0x${string}`;
      await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
      await refetch();
      return hash;
    } catch (error) {
      const message = decodeContractError(error);
      setActionError(message);
      throw new Error(message);
    } finally {
      setIsPending(false);
    }
  }, [embeddedWallet, embeddedAddress, contractAddress, refetch]);

  return {
    contractAddress,
    connectedAddress,
    totalCount,
    myCount,
    directCount,
    isLoading,
    isPending,
    actionError,
    refetch,
    increaseCounter,
  };
}
