import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { monadTestnet } from "thirdweb/chains";

const client = createThirdwebClient({ secretKey: process.env.SECRET_KEY! });

const thirdwebX402Facilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET!,
  waitUntil: "confirmed", // Wait for on-chain confirmation to get tx details
});

export async function GET(request: Request) {
    try {
        const paymentData = request.headers.get("x-payment");

        const result = await settlePayment({
            resourceUrl: "http://localhost:3000/api/premium", // change to your production URL
            method: "GET",
            paymentData,
            network: monadTestnet, // payable on monad testnet
            price: "$0.0001", // Amount per request
            payTo: process.env.SERVER_WALLET!, // payment receiver
            facilitator: thirdwebX402Facilitator,
        });

        if (result.status === 200) {
            // Log the full payment receipt to see all available fields
            console.log("=== Payment Receipt ===");
            console.log(JSON.stringify(result.paymentReceipt, null, 2));
            console.log("=== Full Result ===");
            console.log(JSON.stringify(result, null, 2));

            // Return paid response with full receipt
            return NextResponse.json({
                message: "Payment successful!",
                receipt: result.paymentReceipt,
                // Include any other fields from result that might have tx info
                settledAt: new Date().toISOString(),
            });
        } else {
            // send payment status
            return new NextResponse(
            JSON.stringify(result.responseBody),
                {
                    status: result.status,
                    headers: { "Content-Type": "application/json", ...(result.responseHeaders || {}) },
                }
            );
        }
    } catch(error) {
        console.error(error);
        
        return new NextResponse(
            JSON.stringify({ error: "server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}