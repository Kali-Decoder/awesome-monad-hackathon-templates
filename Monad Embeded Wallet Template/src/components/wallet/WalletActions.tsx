'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, ArrowDownToLine } from 'lucide-react'
import { formatEther, type Address } from 'viem'
import { publicClient } from '@/lib/viem'
import { AddFundsModal } from './AddFundsModal'
import { WithdrawModal } from './WithdrawModal'
import { useWallets } from '@privy-io/react-auth'

const DEBUG_LOGS = process.env.NEXT_PUBLIC_DEBUG_LOGS === '1'

function shortHash(hash: string) {
  if (!hash) return ''
  if (hash.length <= 18) return hash
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export function WalletActions() {
  const { wallets, ready } = useWallets()
  const [balance, setBalance] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  // Get embedded wallet
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
  const address = embeddedWallet?.address as Address | undefined

  // Fetch balance
  const fetchBalance = async () => {
    if (!address) return
    
    try {
      const bal = await publicClient.getBalance({ address })
      setBalance(bal)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    if (address) {
      setIsLoading(true)
      fetchBalance()
      // Poll every 10 seconds
      const interval = setInterval(fetchBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [address])

  // Refresh balance manually
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchBalance()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Handle withdrawal transaction using Privy
  const handleWithdraw = async (toAddress: Address, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected')
    if (!embeddedWallet) throw new Error('Embedded wallet not available')
    
    try {
      // Use Privy embedded wallet to send transaction
      const walletClient = await embeddedWallet.getEthereumProvider()
      
      const txHash = await walletClient.request({
        method: 'eth_sendTransaction',
        params: [{
          to: toAddress,
          value: amount.toString(),
        }],
      })

      if (DEBUG_LOGS) {
        console.log('Transfer initiated:', shortHash(String(txHash)))
      }
      return txHash
    } catch (error) {
      console.error('Transfer failed:', error)
      throw error
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900">
        <Wallet className="w-4 h-4 text-zinc-500 animate-pulse" />
        <span className="text-zinc-500 font-semibold text-sm">Loading...</span>
      </div>
    )
  }

  if (!embeddedWallet || !address) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900">
        <Wallet className="w-4 h-4 text-zinc-500" />
        <span className="text-zinc-500 font-semibold text-sm">No wallet</span>
      </div>
    )
  }

  const balanceInMON = parseFloat(formatEther(balance))

  return (
    <>
      <motion.div 
        className="flex items-center gap-1 sm:gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Balance Display */}
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 hover:border-main transition-colors ${
            isRefreshing ? 'animate-pulse' : ''
          }`}
          title="Click to refresh balance"
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-main" />
          {isLoading ? (
            <span className="w-12 sm:w-16 h-4 bg-zinc-700 animate-pulse rounded" />
          ) : (
            <span className="text-white font-semibold text-xs sm:text-sm">
              {balanceInMON.toFixed(2)} MON
            </span>
          )}
        </button>

        {/* Add Funds Button */}
        <button
          onClick={() => setIsAddFundsOpen(true)}
          title="Add Funds"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md bg-main border-2 border-black text-black hover:bg-main/80 transition-colors shadow-brutal-sm"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Withdraw Button */}
        <button
          onClick={() => setIsWithdrawOpen(true)}
          title="Withdraw"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md bg-main border-2 border-black text-black hover:bg-main/80 transition-colors shadow-brutal-sm"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </motion.div>

      {/* Modals */}
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => {
          setIsAddFundsOpen(false)
          handleRefresh()
        }}
        embeddedAddress={address}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => {
          setIsWithdrawOpen(false)
          handleRefresh()
        }}
        embeddedAddress={address}
        currentBalance={balance}
        onWithdraw={handleWithdraw}
      />
    </>
  )
}
