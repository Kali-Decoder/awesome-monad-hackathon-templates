import { Chain } from "viem";

export const monadTestnet: Chain = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadvision.com",
    },
  },
  testnet: true,
};

export const allChains: Chain[] = [monadTestnet];
export const mainnetChains: Chain[] = [];
export const testnetChains: Chain[] = [monadTestnet];
export const popularChains: Chain[] = [monadTestnet];

export const getChainById = (chainId: number): Chain | undefined => {
  return chainId === monadTestnet.id ? monadTestnet : undefined;
};

export const getChainDisplayName = (chain: Chain): string => {
  return chain.name;
};
