import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/sessions";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

export const GET = async () => {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const providerId = session.userId;

    // 1. Get wallet and transaction history in one go
    const wallet = await prisma.wallet.findUnique({
      where: { userId: providerId as string },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50, // Fetch the last 50 transactions
        },
      },
    });

    if (!wallet) {
      // If no wallet, return a default empty state
      return NextResponse.json({
        availableBalance: 0,
        totalEarnings: 0,
        transactionHistory: [],
      });
    }

    // 2. Calculate Total Earnings as sum of all 'completed' transactions plus current wallet balance
    const completedTransactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        status: "completed",
      },
      select: { amount: true },
    });

    const sumCompleted = completedTransactions.reduce(
      (sum, tx) => sum.add(tx.amount),
      new Decimal(0)
    );
    // const totalEarnings = sumCompleted.add(wallet.balance);

    const responsePayload = {
      availableBalance: wallet.balance,
      totalEarnings: sumCompleted,
      transactionHistory: wallet.transactions,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching provider earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings data." },
      { status: 500 }
    );
  }
};
