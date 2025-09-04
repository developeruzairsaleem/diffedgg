import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/sessions";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// CRITICAL METHOD WE HAVE TO MAKE SURE ONLY THE ADMIN CAN CALL THIS
export async function PUT(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    // check if user is authenticated and authorized to access the route
    const cookie = (await cookies())?.get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId || session?.role !== "admin") {
      return NextResponse.json(
        {
          error: "Please provider an admin session cookie",
          success: false,
        },
        { status: 401 }
      );
    }

    // update the order assignment status to verified and move the user amount to his account
    const orderAssignment = await prisma.orderAssignment.update({
      where: {
        id,
      },
      data: { status: "VERIFIED" },
      include: {
        order: true,
      },
    });

    //   currentProvider id will behere
    const currentProviderId = orderAssignment.providerId;

    // number of providers per order that are required
    const numberOfProviders = orderAssignment.order.requiredCount;
    const amount = orderAssignment.order.price;

    // let's assumme the platform_fee_per_order_is 20%
    const totalProvidersEarning = amount * 0.8;

    // current provider earning per order.

    const currentProviderEarning = totalProvidersEarning / numberOfProviders;

    // now let's add that amount to the wallet of the provider
    const wallet = await prisma.wallet.update({
      where: {
        userId: currentProviderId,
      },
      data: {
        balance: {
          increment: currentProviderEarning,
        },
      },
    });

    // now update the transaction table with new entry
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "deposit",
        amount: currentProviderEarning,
        status: "completed",
        description: `$${currentProviderEarning.toFixed(
          2
        )} has been deposited in your wallet by admin for your order.`,
      },
    });
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("something went wrong", error);
  }
}
