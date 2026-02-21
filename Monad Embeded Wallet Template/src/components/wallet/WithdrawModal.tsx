'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { type Address, isAddress, parseEther, formatEther } from 'viem'
import { toast } from 'react-toastify'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  embeddedAddress: Address | null
  currentBalance: bigint
  onWithdraw: (toAddress: Address, amount: bigint) => Promise<void>
}

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  embeddedAddress, 
  currentBalance,
  onWithdraw 
}: WithdrawModalProps) {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const balanceInMON = parseFloat(formatEther(currentBalance))
  const amountNum = parseFloat(amount || '0')

  const handleWithdraw = async () => {
    // Validation
    if (!toAddress) {
      toast.error('Please enter a wallet address')
      return
    }

    if (!isAddress(toAddress)) {
      toast.error('Invalid wallet address')
      return
    }

    if (!amount || amountNum <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Leave some gas buffer (0.001 MON)
    const gasBuffer = 0.001
    if (amountNum > balanceInMON - gasBuffer) {
      toast.error(`Amount exceeds balance (minus ${gasBuffer} MON for gas)`)
      return
    }

    setIsLoading(true)
    try {
      const amountWei = parseEther(amount)
      await toast.promise(onWithdraw(toAddress as Address, amountWei), {
        pending: 'Submitting withdrawal transaction...',
        success: 'Withdrawal successful',
        error: {
          render({ data }) {
            if (data instanceof Error) return data.message
            return 'Failed to withdraw. Please try again.'
          },
        },
      })
      
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setToAddress('')
        setAmount('')
      }, 2000)
    } catch (err: unknown) {
      console.error('Withdraw error:', err)
      // toast.promise handles user-visible error
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setToAddress('')
      setAmount('')
      setSuccess(false)
    }
  }

  if (!embeddedAddress) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="border-2 border-main rounded-lg shadow-brutal-lg p-4 sm:p-6" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Withdraw</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Withdraw funds to another wallet address
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Wallet Address Input */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    disabled={isLoading || success}
                    className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:border-main focus:outline-none disabled:opacity-50 font-mono text-sm"
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-white">
                      Amount
                    </label>
                    <span className="text-xs text-zinc-400">
                      Balance: <span className="text-main font-semibold">{balanceInMON.toFixed(4)} MON</span>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      step="0.0001"
                      min="0"
                      max={balanceInMON}
                      disabled={isLoading || success}
                      className="w-full px-4 py-3 bg-zinc-900 border-2 border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:border-main focus:outline-none disabled:opacity-50 pr-16"
                    />
                    <button
                      onClick={() => setAmount((balanceInMON - 0.001).toFixed(4))}
                      disabled={isLoading || success}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-main hover:text-main/80 transition-colors disabled:opacity-50"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-main/20 border border-main/30 rounded-md p-3"
                  >
                    <p className="text-sm text-main font-semibold">✓ Withdrawal successful!</p>
                  </motion.div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading || success || !toAddress || !amount}
                  className="w-full py-4 bg-main border-2 border-black rounded-md text-black font-bold text-lg hover:bg-main/80 transition-all shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : success ? (
                    '✓ Success!'
                  ) : (
                    'Withdraw'
                  )}
                </button>

                {/* Info */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-md p-3">
                  <p className="text-xs text-purple-300">
                    ⚠️ Withdrawals are sent on <strong>Monad Testnet</strong>. A small amount (≈0.001 MON) is reserved for gas fees.
                  </p>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
