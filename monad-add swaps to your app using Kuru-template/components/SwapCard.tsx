"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useReadContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import {
  generateToken,
  getQuoteWithReferral,
  REFERRER_FEE_BPS,
  type QuoteResponse,
} from "@/lib/kuru-flow";
import { monad } from "@/lib/wagmi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const NATIVE_MON_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const TOKEN_CONFIG = {
  MON: {
    address: NATIVE_MON_ADDRESS,
    symbol: "MON",
    decimals: 18,
    isNative: true,
  },
  USDC: {
    address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603" as const,
    symbol: "USDC",
    decimals: 6,
    isNative: false,
  },
} as const;

type TokenKey = keyof typeof TOKEN_CONFIG;

const DEFAULT_ROUTER_ADDRESS = "0xb3e6778480b2E488385E8205eA05E20060B813cb" as const;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function SwapCard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chainId, status } = useAccount();
  const isLoading = !mounted || status === "connecting" || status === "reconnecting";
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { disconnect } = useDisconnect();
  const { sendTransaction: sendSwapTx, isPending: isSending, data: swapTxHash } = useSendTransaction();
  const { sendTransaction: sendApproveTx, isPending: isApprovePending, data: approveTxHash } = useSendTransaction();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { isSuccess: approveConfirmed, isLoading: approveLoading } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isSuccess: swapConfirmed, isLoading: swapLoading } = useWaitForTransactionReceipt({
    hash: swapTxHash,
  });

  const isWrongNetwork = isConnected && chainId !== monad.id;

  const [tokenInKey, setTokenInKey] = useState<TokenKey>("MON");
  const [tokenOutKey, setTokenOutKey] = useState<TokenKey>("USDC");

  const tokenIn = TOKEN_CONFIG[tokenInKey];
  const tokenOut = TOKEN_CONFIG[tokenOutKey];

  const { data: monBalanceData } = useBalance({ address });
  const monBalance = monBalanceData?.value;

  const { data: usdcBalanceRaw } = useReadContract({
    address: TOKEN_CONFIG.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const usdcBalance = usdcBalanceRaw as bigint | undefined;

  const tokenInBalance = tokenInKey === "MON" ? monBalance : usdcBalance;
  const tokenOutBalance = tokenOutKey === "MON" ? monBalance : usdcBalance;

  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const routerAddress = quote?.transaction?.to || DEFAULT_ROUTER_ADDRESS;

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: tokenIn.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, routerAddress as `0x${string}`] : undefined,
    query: { enabled: !tokenIn.isNative },
  });
  const allowance = tokenIn.isNative ? undefined : (allowanceRaw as bigint | undefined);

  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (approveConfirmed) {
      refetchAllowance();
    }
  }, [approveConfirmed, refetchAllowance]);

  useEffect(() => {
    async function fetchToken() {
      if (address) {
        try {
          const tokenResponse = await generateToken(address);
          setJwtToken(tokenResponse.token);
        } catch (err) {
          console.error("Failed to generate token:", err);
        }
      }
    }
    fetchToken();
  }, [address]);

  useEffect(() => {
    async function fetchQuote() {
      if (!address || !jwtToken || !amount || parseFloat(amount) <= 0) {
        setQuote(null);
        return;
      }

      setIsLoadingQuote(true);
      setError(null);

      try {
        const amountWei = parseUnits(amount, tokenIn.decimals).toString();
        const quoteResponse = await getQuoteWithReferral(
          address,
          tokenIn.address,
          tokenOut.address,
          amountWei,
          jwtToken
        );
        setQuote(quoteResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get quote");
        setQuote(null);
      } finally {
        setIsLoadingQuote(false);
      }
    }

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [address, jwtToken, amount, tokenIn, tokenOut]);

  const amountWei = amount ? parseUnits(amount, tokenIn.decimals) : BigInt(0);
  const needsApproval = !tokenIn.isNative && allowance !== undefined && amountWei > allowance;
  const insufficientBalance = tokenInBalance !== undefined && amountWei > tokenInBalance;

  const handleSwapTokens = () => {
    setTokenInKey(tokenOutKey);
    setTokenOutKey(tokenInKey);
    setAmount("");
    setQuote(null);
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0 || !routerAddress) return;
    setError(null);

    try {
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [routerAddress as `0x${string}`, amountWei],
      });

      sendApproveTx({
        to: tokenIn.address,
        data: approveData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  };

  const handleSwap = async () => {
    if (!quote || quote.status !== "success" || !quote.transaction) {
      setError("No transaction data in quote");
      return;
    }

    try {
      const calldata = quote.transaction.calldata.startsWith("0x")
        ? quote.transaction.calldata
        : `0x${quote.transaction.calldata}`;

      sendSwapTx({
        to: quote.transaction.to as `0x${string}`,
        data: calldata as `0x${string}`,
        value: BigInt(quote.transaction.value || "0"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0";
    const formatted = parseFloat(formatUnits(balance, decimals));
    return decimals === 6 ? formatted.toFixed(2) : formatted.toFixed(4);
  };

  return (
    <div className="w-full space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Swap</CardTitle>
            {isConnected && !isWrongNetwork && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-subtle" />
                <span className="text-sm text-muted-foreground font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnect()}
                  className="h-auto py-1 px-2 text-sm text-muted-foreground hover:text-destructive"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-[104px] rounded-xl bg-muted animate-pulse" />
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="h-[104px] rounded-xl bg-muted animate-pulse" />
              <div className="h-12 rounded-xl bg-muted animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3">
              {isWrongNetwork && (
                <Alert variant="destructive" className="mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please switch to Monad Mainnet to continue
                  </AlertDescription>
                </Alert>
              )}
              {/* Input Token */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">You pay</span>
                  {isConnected && !isWrongNetwork && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Balance: {formatBalance(tokenInBalance, tokenIn.decimals)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (tokenInBalance) {
                            setAmount(formatUnits(tokenInBalance, tokenIn.decimals));
                          }
                        }}
                        className="h-auto py-0.5 px-2 text-sm font-semibold text-primary hover:text-primary/80"
                      >
                        MAX
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    disabled={!isConnected || isWrongNetwork}
                    className="min-w-0 flex-1 border-0 bg-transparent text-2xl font-semibold p-0 h-auto outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Badge variant="secondary" className="text-base font-semibold px-3 py-1.5 shrink-0">
                    {tokenIn.symbol}
                  </Badge>
                </div>
              </div>

              {/* Swap Direction */}
              <div className="flex justify-center -my-1.5 relative z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapTokens}
                  className="h-10 w-10 rounded-full bg-background shadow-sm"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Output Token */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">You receive</span>
                  {isConnected && !isWrongNetwork && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {formatBalance(tokenOutBalance, tokenOut.decimals)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1 text-2xl font-semibold truncate">
                    {isLoadingQuote ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </span>
                    ) : quote?.status === "success" ? (
                      parseFloat(formatUnits(BigInt(quote.output), tokenOut.decimals)).toFixed(
                        tokenOut.decimals === 6 ? 2 : 4
                      )
                    ) : (
                      <span className="text-muted-foreground/50">0.0</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-base font-semibold px-3 py-1.5 shrink-0">
                    {tokenOut.symbol}
                  </Badge>
                </div>
              </div>

              {/* Fee Info */}
              {isConnected && !isWrongNetwork && (
                <p className="text-sm text-muted-foreground text-center py-1">
                  Includes {REFERRER_FEE_BPS / 100}% referral fee
                </p>
              )}

              {/* Error */}
              {error && isConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Transaction Status */}
              {isConnected && (approveTxHash || swapTxHash) && (
                <div className="rounded-xl border p-4 bg-muted/30">
                  {approveTxHash && !swapTxHash && (
                    <div className="flex items-center gap-2">
                      {approveLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                          <span className="text-sm text-amber-600">Confirming approval...</span>
                        </>
                      ) : approveConfirmed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Approval confirmed!</span>
                        </>
                      ) : null}
                    </div>
                  )}
                  {swapTxHash && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {swapLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-primary">Confirming swap...</span>
                          </>
                        ) : swapConfirmed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Swap confirmed!</span>
                          </>
                        ) : null}
                      </div>
                      <a
                        href={`https://monadvision.com/tx/${swapTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!isConnected ? (
                <Button
                  onClick={() => open()}
                  className="w-full"
                  size="lg"
                >
                  Connect Wallet
                </Button>
              ) : isWrongNetwork ? (
                <Button
                  onClick={() => switchChain({ chainId: monad.id })}
                  disabled={isSwitching}
                  className="w-full"
                  size="lg"
                >
                  {isSwitching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Switch to Monad
                </Button>
              ) : insufficientBalance ? (
                <Button disabled className="w-full" size="lg">
                  Insufficient {tokenIn.symbol} Balance
                </Button>
              ) : needsApproval ? (
                <Button
                  onClick={handleApprove}
                  disabled={isApprovePending || !amount || parseFloat(amount) <= 0}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isApprovePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isApprovePending ? "Approving..." : `Approve ${tokenIn.symbol}`}
                </Button>
              ) : (
                <Button
                  onClick={handleSwap}
                  disabled={!quote || quote.status !== "success" || isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSending ? "Swapping..." : "Swap"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Panel */}
      <div>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className={`h-3 w-3 transition-transform ${showDebug ? "rotate-90" : ""}`} />
          Debug Info
        </button>

        {showDebug && (
          <Card className="mt-2 shadow-sm">
            <CardContent className="p-4 text-sm font-mono space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Connection:</span>
                <span className={isConnected ? "text-green-600" : "text-red-600"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className={chainId === monad.id ? "text-green-600" : "text-amber-600"}>
                    {chainId} {chainId === monad.id ? "(Monad)" : "(Wrong)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">JWT:</span>
                <span className={jwtToken ? "text-green-600" : "text-red-600"}>
                  {jwtToken ? `${jwtToken.slice(0, 20)}...` : "None"}
                </span>
              </div>

              <div>
                <div className="text-muted-foreground">Tokens:</div>
                <div className="ml-2">In: {tokenIn.symbol} ({tokenIn.address.slice(0, 10)}...)</div>
                <div className="ml-2">Out: {tokenOut.symbol} ({tokenOut.address.slice(0, 10)}...)</div>
              </div>

              <div>
                <div className="text-muted-foreground">Allowance:</div>
                <div className="ml-2">
                  {allowance ? formatUnits(allowance, tokenIn.decimals) : "0"} {tokenIn.symbol}
                </div>
                <div className="ml-2">
                  Needs approval:{" "}
                  <span className={needsApproval ? "text-amber-600" : "text-green-600"}>
                    {needsApproval ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {quote && (
                <div>
                  <div className="text-muted-foreground">Quote:</div>
                  <pre className="mt-1 p-2 rounded-lg bg-muted overflow-x-auto max-h-40 overflow-y-auto text-xs">
                    {JSON.stringify(quote, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
