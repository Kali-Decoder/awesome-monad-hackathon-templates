import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/config/chains";

export const publicTransport = http("https://testnet-rpc.monad.xyz", {
  retryCount: 3,
  retryDelay: 1000,
  timeout: 30_000,
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: publicTransport,
});
