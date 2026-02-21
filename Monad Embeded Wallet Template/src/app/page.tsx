'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEmbeddedWallet } from '@/hooks/useEmbeddedWallet'
import { useCounterContract } from '@/hooks/useMyContract'
import { Button } from '@/components/ui/Button'
import { WalletActions } from '@/components/wallet/WalletActions'
import { toast } from 'react-toastify'
import { Copy } from 'lucide-react'

export default function Home() {
  const { login, logout, ready, authenticated } = usePrivy()
  const { address } = useEmbeddedWallet()
  const {
    totalCount,
    myCount,
    directCount,
    connectedAddress,
    isLoading,
    isPending,
    increaseCounter,
    contractAddress,
  } = useCounterContract()

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`)
    }
  }

  return (
    <main className="min-h-screen bg-grid px-4 py-10" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-white sm:text-3xl">Monad Embedded Wallet Example</h1>
          {authenticated ? (
            <div className="flex items-center gap-2">
              <WalletActions />
              <Button size="sm" variant="neutral" onClick={logout}>Sign out</Button>
            </div>
          ) : (
            <Button size="sm" onClick={login} disabled={!ready}>Connect Wallet</Button>
          )}
        </div>

        <section className="rounded-xl border-2 border-main bg-zinc-950/80 p-6 shadow-brutal">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">My Count</p>
              <div className="text-5xl font-black text-fuchsia-400 sm:text-6xl">
                {isLoading ? '...' : myCount.toString()}
              </div>
              <p className="mt-2 text-xs text-zinc-500">Wallet msg.sender view</p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Total Count</p>
              <div className="text-5xl font-black text-main sm:text-6xl">
                {isLoading ? '...' : totalCount.toString()}
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/80 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Embedded Wallet Count</p>
            <div className="text-4xl font-black text-cyan-300 sm:text-5xl">
              {isLoading ? '...' : directCount.toString()}
            </div>
            <p className="mt-2 font-mono text-xs text-zinc-500 break-all">
              {connectedAddress ?? 'No embedded wallet address'}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={async () => {
              try {
                const txPromise = increaseCounter()
                await toast.promise(txPromise, {
                  pending: 'Submitting counter transaction...',
                  success: {
                    render({ data }) {
                      const txHash = String(data ?? '')
                      if (!txHash) return 'Counter increased successfully.'
                      return `Counter increased: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`
                    },
                  },
                  error: {
                    render({ data }) {
                      if (data instanceof Error) return data.message
                      return 'Failed to increase counter.'
                    },
                  },
                })
              } catch {
                // toast.promise handles user-visible errors
              }
            }}
            disabled={!authenticated || isPending}
          >
            {isPending ? 'Confirming...' : 'Increase Counter'}
          </Button>

          <div className="mt-6 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300">
            {authenticated ? (
              <>
                <p className="mb-1 font-semibold text-white">Wallet connected</p>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs text-zinc-400 break-all">{address ?? 'No embedded address found'}</p>
                  {address && (
                    <button
                      onClick={() => copyText(address, 'Embedded wallet address')}
                      className="shrink-0 inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:text-white hover:border-main transition-colors"
                      title="Copy embedded wallet address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <p className="font-mono text-xs text-zinc-500 break-all">Contract: {contractAddress}</p>
                  <button
                    onClick={() => copyText(contractAddress, 'Smart contract address')}
                    className="shrink-0 inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-300 hover:text-white hover:border-main transition-colors"
                    title="Copy smart contract address"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-400">Use the wallet chip above to deposit and withdraw MON.</p>
              </>
            ) : (
              <p>Connect wallet to enable deposit and withdraw functionality.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
