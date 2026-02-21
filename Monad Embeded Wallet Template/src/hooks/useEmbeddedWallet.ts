'use client'

import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, type Address } from 'viem'
import { monadTestnet } from '@/config/chains'

type WalletClient = ReturnType<typeof createWalletClient>
type PrivyWallet = ReturnType<typeof useWallets>['wallets'][number]

interface EmbeddedWalletResult {
  address: Address | null
  walletClient: WalletClient | null
  isLoading: boolean
  embeddedWallet: PrivyWallet | null
  externalWallets: PrivyWallet[]
}

/**
 * Hook to access the Privy embedded EVM wallet and create a viem wallet client
 */
export function useEmbeddedWallet(): EmbeddedWalletResult {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Find the embedded wallet (walletClientType === 'privy')
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy') ?? null
  
  // Get external wallets (for future use)
  const externalWallets = wallets.filter(wallet => wallet.walletClientType !== 'privy')

  const address = embeddedWallet?.address as Address | null

  useEffect(() => {
    const setupWalletClient = async () => {
      if (!authenticated || !embeddedWallet) {
        setWalletClient(null)
        setIsLoading(false)
        return
      }

      try {
        // Get the EIP-1193 provider from the embedded wallet
        const provider = await embeddedWallet.getEthereumProvider()

        // Create a viem wallet client with the provider
        const client = createWalletClient({
          account: embeddedWallet.address as Address,
          chain: monadTestnet,
          transport: custom(provider),
        })

        setWalletClient(client)
      } catch (error) {
        console.error('Failed to setup wallet client:', error)
        setWalletClient(null)
      } finally {
        setIsLoading(false)
      }
    }

    setupWalletClient()
  }, [authenticated, embeddedWallet])

  return {
    address,
    walletClient,
    isLoading,
    embeddedWallet,
    externalWallets,
  }
}
