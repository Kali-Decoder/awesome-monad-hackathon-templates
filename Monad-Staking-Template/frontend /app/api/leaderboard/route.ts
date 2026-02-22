import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/lib/models/Transaction";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 10), 1), 100);

    const leaderboard = await Transaction.aggregate([
      {
        $group: {
          _id: "$walletAddress",
          totalWonWei: {
            $sum: {
              $cond: [
                { $eq: ["$action", "scratch_reward"] },
                { $toDecimal: "$amountWei" },
                0,
              ],
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
          txCount: { $sum: 1 },
          lastActivity: { $max: "$occurredAt" },
        },
      },
      {
        $sort: {
          totalWonWei: -1,
          scratchCount: -1,
          lastActivity: -1,
        },
      },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          walletAddress: "$_id",
          totalWonWei: { $toString: "$totalWonWei" },
          totalClaimedWei: { $toString: "$totalClaimedWei" },
          scratchCount: 1,
          txCount: 1,
          lastActivity: 1,
        },
      },
    ]);

    return NextResponse.json({ ok: true, leaderboard });
  } catch (error: any) {
    console.error("GET /api/leaderboard failed:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
