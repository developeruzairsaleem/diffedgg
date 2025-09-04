/*
  Script: Add earnings and transactions for provider 'dsas'
  Usage: npx ts-node --project tsconfig.local.json prisma/add_provider_earnings.ts
*/

import { prisma } from "../src/lib/prisma";
import { Prisma } from "../src/generated/prisma";

async function main() {
  const targetUsername = "dsas";

  const user = await prisma.user.findFirst({
    where: { username: targetUsername, role: "provider" as any },
  });

  if (!user) {
    console.error(`Provider with username '${targetUsername}' not found.`);
    process.exit(1);
  }

  // Ensure wallet exists
  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId: user.id, balance: new Prisma.Decimal("0.00") },
    });
    console.log(`Created wallet for user '${targetUsername}'.`);
  }

  // Create sample transactions: three payments (earnings) and one withdrawal
  const txsToCreate = [
    {
      type: "payment" as const,
      amount: new Prisma.Decimal("120.00"),
      description: `Earnings for order ORD-1001: $${new Prisma.Decimal(
        "120.00"
      ).toFixed(2)}`,
      paymentMethod: "stripe" as const,
      status: "completed" as const,
    },
    {
      type: "payment" as const,
      amount: new Prisma.Decimal("85.50"),
      description: `Earnings for order ORD-1002: $${new Prisma.Decimal(
        "85.50"
      ).toFixed(2)}`,
      paymentMethod: "paypal" as const,
      status: "completed" as const,
    },
    {
      type: "payment" as const,
      amount: new Prisma.Decimal("64.25"),
      description: `Earnings for order ORD-1003: $${new Prisma.Decimal(
        "64.25"
      ).toFixed(2)}`,
      paymentMethod: "stripe" as const,
      status: "completed" as const,
    },
    {
      type: "withdrawal" as const,
      amount: new Prisma.Decimal("50.00"),
      description: "Payout to provider",
      paymentMethod: "stripe" as const,
      status: "completed" as const,
    },
  ];

  // Create transactions
  for (const tx of txsToCreate) {
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: tx.type as any,
        amount: tx.amount,
        description: tx.description,
        paymentMethod: tx.paymentMethod as any,
        status: tx.status as any,
      },
    });
  }

  // Recalculate wallet balance based on completed transactions
  const completedTx = await prisma.transaction.findMany({
    where: { walletId: wallet.id, status: "completed" as any },
    select: { type: true, amount: true },
  });

  let balance = new Prisma.Decimal("0.00");
  for (const t of completedTx) {
    if (t.type === ("withdrawal" as any)) {
      balance = balance.minus(t.amount);
    } else {
      // deposit/payment/refund (refund could be debated; keep simple here)
      balance = balance.plus(t.amount);
    }
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance },
  });

  console.log(`Added ${txsToCreate.length} transactions.`);
  console.log(
    `New wallet balance for '${targetUsername}': $${balance.toFixed(2)}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
