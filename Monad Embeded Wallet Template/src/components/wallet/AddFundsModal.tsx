'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, CreditCard, QrCode } from 'lucide-react'
import { type Address } from 'viem'
import dynamic from 'next/dynamic'
import { toast } from 'react-toastify'

// Dynamic import to avoid SSR issues
const QRCodeComponent = dynamic(
  () => import('react-qr-code').then(mod => mod.default || mod),
  { 
    ssr: false,
    loading: () => (
      <div className="w-40 h-40 sm:w-48 sm:h-48 bg-zinc-100 rounded-md animate-pulse" />
    )
  }
)

interface AddFundsModalProps {
  isOpen: boolean
  onClose: () => void
  embeddedAddress: Address | null
}

export function AddFundsModal({ isOpen, onClose, embeddedAddress }: AddFundsModalProps) {
  const [activeTab, setActiveTab] = useState<'transfer' | 'receive'>('transfer')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!embeddedAddress) return
    
    try {
      await navigator.clipboard.writeText(embeddedAddress)
      setCopied(true)
      toast.success('Wallet address copied')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy wallet address')
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
            onClick={onClose}
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
                  <h2 className="text-lg sm:text-xl font-bold text-white">Add funds to your counter wallet</h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-md font-semibold text-xs sm:text-sm transition-all ${
                      activeTab === 'transfer'
                        ? 'bg-main text-black border-2 border-black shadow-brutal-sm'
                        : 'bg-zinc-800 text-white border-2 border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Transfer from wallet</span>
                    <span className="xs:hidden">Transfer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('receive')}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-md font-semibold text-xs sm:text-sm transition-all ${
                      activeTab === 'receive'
                        ? 'bg-main text-black border-2 border-black shadow-brutal-sm'
                        : 'bg-zinc-800 text-white border-2 border-zinc-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Receive funds</span>
                    <span className="xs:hidden">Receive</span>
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {activeTab === 'transfer' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-400">
                        Send MON from your external wallet (e.g., MetaMask) to this address on <span className="text-main font-semibold">Monad Testnet</span>:
                      </p>
                      
                      {/* Address Display */}
                      <div className="bg-zinc-900 border border-zinc-700 rounded-md p-4">
                        <p className="text-xs text-zinc-500 mb-2">Your wallet address</p>
                        <div className="flex items-center justify-between gap-3">
                          <code className="text-sm text-white font-mono break-all flex-1">
                            {embeddedAddress}
                          </code>
                          <button
                            onClick={handleCopy}
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md bg-main border-2 border-black text-black hover:bg-main/80 transition-colors"
                            title="Copy address"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-md p-3">
                        <p className="text-xs text-purple-300">
                          ⚠️ Make sure to send on <strong>Monad Testnet</strong>. Funds sent on other networks will be lost.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-400">
                        Scan this QR code to send MON on <span className="text-main font-semibold">Monad Testnet</span>:
                      </p>
                      
                      {/* QR Code */}
                      <div className="bg-white rounded-md p-4 sm:p-6 flex items-center justify-center">
                        <div className="w-40 h-40 sm:w-48 sm:h-48">
                          <QRCodeComponent 
                            value={embeddedAddress}
                            size={192}
                            level="H"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          />
                        </div>
                      </div>

                      {/* Address below QR */}
                      <div className="bg-zinc-900 border border-zinc-700 rounded-md p-3">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-white font-mono break-all flex-1">
                            {embeddedAddress}
                          </code>
                          <button
                            onClick={handleCopy}
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-main border-2 border-black text-black hover:bg-main/80 transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-zinc-700">
                  <p className="text-xs text-zinc-500 text-center">
                    Protected by <span className="text-white font-semibold">Privy</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
