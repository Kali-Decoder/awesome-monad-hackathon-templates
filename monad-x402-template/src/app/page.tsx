"use client";

import { useState, useRef, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "YOUR_PUBLIC_CLIENT_ID",
});

type LogEntry = {
  id: number;
  timestamp: string;
  type: "request" | "response" | "info" | "error" | "success" | "wallet" | "payment";
  message: string;
  data?: unknown;
};

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry["type"], message: string, data?: unknown) => {
    const entry: LogEntry = {
      id: logIdRef.current++,
      timestamp: new Date().toISOString().split("T")[1].slice(0, 12),
      type,
      message,
      data,
    };
    setLogs((prev) => [...prev, entry]);
  };

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
    logIdRef.current = 0;
  };

  const payAndFetch = async () => {
    clearLogs();
    setStatus("loading");

    addLog("info", "=== Starting x402 Payment Flow ===");

    try {
      // Connect wallet
      addLog("wallet", "Connecting to MetaMask...");
      const wallet = createWallet("io.metamask");
      const account = await wallet.connect({ client });
      addLog("wallet", `Wallet connected: ${account.address}`);

      // First request - should get 402
      addLog("request", "GET /api/premium (no payment header)");

      const rawRes = await fetch("/api/premium");
      addLog("response", `Status: ${rawRes.status} ${rawRes.statusText}`);

      if (rawRes.status === 402) {
        const body = await rawRes.clone().json();
        addLog("response", "Received 402 Payment Required", body);

        // Show the payment requirements
        if (body.paymentRequirements) {
          addLog("payment", "Payment requirements:", body.paymentRequirements);
        }
      }

      // Now wrap fetch and make the paid request
      addLog("info", "Creating payment-wrapped fetch...");
      const fetchPay = wrapFetchWithPayment(fetch, client, wallet);

      addLog("wallet", "Requesting wallet signature for payment...");
      addLog("request", "GET /api/premium (with x-payment header)");

      const res = await fetchPay("/api/premium");
      const json = await res.json();

      addLog("response", `Status: ${res.status} ${res.statusText}`);

      if (res.ok) {
        addLog("response", "Response body:", json);

        if (json.receipt) {
          addLog("success", "=== Payment Settled ===");
          const receipt = json.receipt as Record<string, unknown>;

          // Log all receipt fields
          Object.entries(receipt).forEach(([key, value]) => {
            addLog("success", `${key}: ${String(value)}`);
          });

          // Add explorer link for the payer address
          if (receipt.payer) {
            addLog("info", `View on Monad Explorer: https://testnet.monadexplorer.com/address/${receipt.payer}`);
          }

          // Note about facilitator
          addLog("info", "Note: 'transaction' is facilitator reference ID, not on-chain tx hash");
          addLog("info", "Check Thirdweb dashboard for actual on-chain tx details");
        }

        if (json.settledAt) {
          addLog("info", `Settled at: ${json.settledAt}`);
        }

        setStatus("success");
      } else {
        addLog("error", "Request failed", json);
        throw new Error(json.error || "Payment failed");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog("error", `Error: ${msg}`);
      setStatus("error");
    }

    addLog("info", "=== Flow Complete ===");
  };

  const reset = () => {
    setStatus("idle");
    clearLogs();
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 font-mono">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-400">x402 Protocol Logger</h1>
          <div className="flex gap-2">
            {status === "idle" && (
              <button
                onClick={payAndFetch}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded text-sm"
              >
                ▶ RUN
              </button>
            )}
            {status === "loading" && (
              <span className="px-4 py-2 bg-yellow-600 text-black font-bold rounded text-sm animate-pulse">
                RUNNING...
              </span>
            )}
            {(status === "success" || status === "error") && (
              <button
                onClick={reset}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded text-sm"
              >
                RESET
              </button>
            )}
            {logs.length > 0 && (
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-sm"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Endpoint info bar */}
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 border-b border-zinc-800 pb-2">
          <span>Endpoint: <span className="text-green-400">/api/premium</span></span>
          <span>Price: <span className="text-yellow-400">$0.0001 USDC</span></span>
          <span>Network: <span className="text-purple-400">Monad Testnet</span></span>
          <span className="ml-auto flex gap-3">
            <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">x402 Spec</a>
            <a href="https://portal.thirdweb.com/payments/x402" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Thirdweb Docs</a>
            <a href="https://testnet.monadexplorer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Monad Explorer</a>
          </span>
        </div>

        {/* Log output */}
        <div
          ref={logContainerRef}
          className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 h-[70vh] overflow-y-auto text-sm"
        >
          {logs.length === 0 ? (
            <div className="text-zinc-600">
              Press RUN to start the x402 payment flow and see what happens...
            </div>
          ) : (
            logs.map((log) => <LogLine key={log.id} log={log} />)
          )}
        </div>
      </div>
    </main>
  );
}

function LogLine({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);

  const colors: Record<LogEntry["type"], string> = {
    request: "text-blue-400",
    response: "text-cyan-400",
    info: "text-zinc-500",
    error: "text-red-400",
    success: "text-green-400",
    wallet: "text-orange-400",
    payment: "text-yellow-400",
  };

  const prefixes: Record<LogEntry["type"], string> = {
    request: "[REQ]",
    response: "[RES]",
    info: "[---]",
    error: "[ERR]",
    success: "[OK!]",
    wallet: "[WAL]",
    payment: "[PAY]",
  };

  const hasData = log.data !== undefined;

  return (
    <div className="py-0.5">
      <div
        className={`flex gap-2 ${hasData ? "cursor-pointer hover:bg-zinc-900" : ""}`}
        onClick={() => hasData && setExpanded(!expanded)}
      >
        <span className="text-zinc-600 shrink-0 w-24">{log.timestamp}</span>
        <span className={`shrink-0 w-12 ${colors[log.type]}`}>{prefixes[log.type]}</span>
        <span className={colors[log.type]}>{log.message}</span>
        {hasData && (
          <span className="text-zinc-600 ml-1">{expanded ? "▼" : "▶"}</span>
        )}
      </div>
      {expanded && hasData && (
        <pre className="ml-40 mt-1 p-2 bg-zinc-900 rounded text-xs overflow-x-auto text-zinc-300">
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
