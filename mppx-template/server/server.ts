import "dotenv/config";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Mppx } from "mppx/server";
import { monad } from "@monad-crypto/mpp/server";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, createWalletClient, http, defineChain, formatEther } from "viem";
import { greetings } from "./greetings";

// ✅ Create app
const app = new Hono();

// ✅ Env validation
if (!process.env.SERVER_PRIVATE_KEY) {
  throw new Error("❌ Missing SERVER_PRIVATE_KEY in .env");
}

if (!process.env.MPP_SECRET_KEY) {
  throw new Error("❌ Missing MPP_SECRET_KEY in .env");
}

// ✅ Setup account
const account = privateKeyToAccount(
  process.env.SERVER_PRIVATE_KEY as `0x${string}`
);

// ✅ Define Monad Testnet (chainId 10143)
const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
});

// ✅ Create WALLET client (🔥 CRITICAL FIX)
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

// ✅ Create PUBLIC client for balance reads
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// ✅ Setup MPPX
const mppx = Mppx.create({
  secretKey: process.env.MPP_SECRET_KEY,
  methods: [
    monad.charge({
      account,
      recipient: account.address,
      testnet: true,
      getClient: () => walletClient, // ✅ use getClient (required by SDK)
    }),
  ],
});

// 🎲 Random greeting
function getRandomGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// 🆓 Health route
app.get("/", (c) => {
  return c.text("✅ MPPX Server is running");
});

// 💸 Paid route
app.get(
  "/greeting",
  async (c, next) => {
    try {
      const balance = await publicClient.getBalance({
        address: account.address,
      });
      console.log(
        `🪙 Monad balance for ${account.address}: ${formatEther(balance)} MON`
      );
    } catch (err) {
      console.error("❌ Failed to fetch Monad balance:", err);
    }
    await next();
  },
  mppx.charge({
    amount: "1000000000000000",
    description: "Unlock a random greeting 🌍",
  }),
  (c) => {
    const greeting = getRandomGreeting();

    console.log("💰 Payment successful →", greeting);

    return c.json({
      success: true,
      greeting,
    });
  }
);

// 🚀 Start server
const PORT = process.env.PORT || 8080;

serve({
  fetch: app.fetch,
  port: Number(PORT),
});

console.log(`🚀 Server running on http://localhost:${PORT}`);
