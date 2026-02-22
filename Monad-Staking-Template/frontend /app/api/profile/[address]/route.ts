import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/lib/models/Transaction";

export const runtime = "nodejs";

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectToDatabase();
    const { address } = await params;
    const walletAddress = String(address || "").toLowerCase();

    if (!ADDRESS_REGEX.test(walletAddress)) {
      return NextResponse.json(
        { ok: false, error: "Invalid address" },
        { status: 400 }
      );
    }

    const [summaryRows, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { walletAddress } },
        {
          $group: {
            _id: "$walletAddress",
            totalWonWei: {
              $sum: {
                $cond: [{ $eq: ["$action", "scratch_reward"] }, { $toDecimal: "$amountWei" }, 0],
              },
            },
            totalClaimedWei: {
              $sum: {
                $cond: [{ $eq: ["$action", "claim"] }, { $toDecimal: "$amountWei" }, 0],
              },
            },
            scratchCount: {
              $sum: {
                $cond: [{ $eq: ["$action", "scratch_reward"] }, 1, 0],
              },
            },
            claimCount: {
              $sum: {
                $cond: [{ $eq: ["$action", "claim"] }, 1, 0],
              },
            },
            txCount: { $sum: 1 },
            lastActivity: { $max: "$occurredAt" },
          },
        },
        {
          $project: {
            _id: 0,
            walletAddress: "$_id",
            totalWonWei: { $toString: "$totalWonWei" },
            totalClaimedWei: { $toString: "$totalClaimedWei" },
            scratchCount: 1,
            claimCount: 1,
            txCount: 1,
            lastActivity: 1,
          },
        },
      ]),
      Transaction.find({ walletAddress })
        .sort({ occurredAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const summary = summaryRows[0] ?? {
      walletAddress,
      totalWonWei: "0",
      totalClaimedWei: "0",
      scratchCount: 0,
      claimCount: 0,
      txCount: 0,
      lastActivity: null,
    };

    return NextResponse.json({
      ok: true,
      summary,
      transactions: recentTransactions,
    });
  } catch (error: any) {
    console.error("GET /api/profile/[address] failed:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}
