import { defineChain } from 'viem'
import { http, createConfig } from 'wagmi'

// Monad Testnet - Complete config for Privy compatibility
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { 
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: { 
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Testnet Explorer', 
      url: 'https://testnet.monadvision.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1620204,
    },
  },
  testnet: true,
})


export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz', {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 30000,
    }),
  },
})

export const CONTRACT_ADDRESSES = {
  // Set NEXT_PUBLIC_COUNTER_ADDRESS to override the deployed counter address.
  counter: (process.env.NEXT_PUBLIC_COUNTER_ADDRESS as `0x${string}` | undefined)
    ?? "0x65138ffa2eC30375776627bFF6318D3e792Bd0B9",
} as const;
