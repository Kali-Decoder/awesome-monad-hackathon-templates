import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/lib/models/Transaction";

export const runtime = "nodejs";

const VALID_ACTIONS = new Set(["scratch_reward", "claim"]);

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const walletAddress = String(body?.walletAddress || "").trim().toLowerCase();
    const txHash = String(body?.txHash || "").trim().toLowerCase();
    const action = String(body?.action || "").trim();
    const amountWei = String(body?.amountWei || "").trim();
    const contractAddress = String(body?.contractAddress || "").trim().toLowerCase();
    const chainId = Number(body?.chainId);
    const occurredAt = body?.occurredAt ? new Date(body.occurredAt) : new Date();

    if (!walletAddress || !txHash || !amountWei || !contractAddress || !Number.isFinite(chainId)) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!VALID_ACTIONS.has(action)) {
      return NextResponse.json(
        { ok: false, error: "Invalid action. Use scratch_reward or claim." },
        { status: 400 }
      );
    }

    await Transaction.updateOne(
      { txHash },
      {
        walletAddress,
        txHash,
        action,
        amountWei,
        contractAddress,
        chainId,
        occurredAt,
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("POST /api/transactions failed:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to store transaction" },
      { status: 500 }
    );
  }
}
