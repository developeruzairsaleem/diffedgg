import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "../../../lib/paypal";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";
// @ts-ignore - PayPal checkout SDK doesn't have official types
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

export async function POST(req: NextRequest) {
  try {
    console.log("PayPal order creation started");
    const {
      subpackageId,
      customerEmail,
      numberOfGames,
      numberOfTeammates,
      rankName,
    } = await req.json();

    console.log("Request data:", {
      subpackageId,
      numberOfGames,
      numberOfTeammates,
      rankName,
    });

    if (!subpackageId) {
      console.log("Error: Missing subpackageId");
      return NextResponse.json(
        { error: "Missing subpackageId", success: false },
        { status: 400 }
      );
    }

    // Verify the customer current session
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      console.log("Error: Invalid session");
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    console.log("Session verified for user:", session.userId);

    // Get the package item from DB
    const subpackage = await prisma.subpackage.findFirst({
      where: { id: subpackageId },
      include: {
        service: {
          include: { game: true },
        },
      },
    });

    if (!subpackage) {
      console.log("Error: Package not found for ID:", subpackageId);
      return NextResponse.json(
        { error: "Package not found", success: false },
        { status: 400 }
      );
    }

    console.log("Package found:", subpackage.name, "Price:", subpackage.price);

    // Calculate total price (similar to frontend logic)
    let basePrice = subpackage.price;

    // Add rank additional cost if provided
    if (rankName && Array.isArray(subpackage.ranks)) {
      const selectedRank = subpackage.ranks.find(
        (rank: any) => rank.name === rankName
      );
      if (
        selectedRank &&
        typeof selectedRank === "object" &&
        selectedRank !== null &&
        "additionalCost" in selectedRank &&
        typeof (selectedRank as any).additionalCost === "number"
      ) {
        basePrice += (selectedRank as any).additionalCost;
      }
    }

    // Multiply by number of games if > 1
    if (numberOfGames && numberOfGames > 1) {
      basePrice *= numberOfGames;
    }

    // Multiply by number of teammates if > 1
    if (numberOfTeammates && numberOfTeammates > 1) {
      basePrice *= numberOfTeammates;
    }

    // Dynamic pricing logic
    let totalPrice = basePrice;

    console.log("Final calculated price:", totalPrice);

    // Create PayPal order
    console.log("Creating PayPal order...");
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalPrice.toFixed(2),
          },
          description: `Order for ${subpackage.name} - ${subpackage.service.game.name}`,
          custom_id: subpackageId,
          invoice_id: `INV-${Date.now()}`,
        },
      ],
      application_context: {
        return_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/customer/checkout/${subpackageId}?success=true`,
        cancel_url: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/dashboard/customer/checkout/${subpackageId}?canceled=true`,
        brand_name: "Diffed.gg",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    };

    console.log("PayPal order payload:", JSON.stringify(orderPayload, null, 2));
    request.requestBody(orderPayload);

    const order = await paypalClient.execute(request);
    console.log("PayPal order created successfully:", order.result.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.result.id,
        approvalUrl: order.result.links.find(
          (link: any) => link.rel === "approve"
        )?.href,
        subpackage,
        finalPrice: totalPrice,
      },
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        success: false,
      },
      { status: 500 }
    );
  }
}
