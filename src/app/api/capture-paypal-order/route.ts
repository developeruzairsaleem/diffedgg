import { NextRequest, NextResponse } from "next/server";
import { paypalClient } from "../../../lib/paypal";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";
// @ts-ignore - PayPal checkout SDK doesn't have official types
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json(
        { error: "Order ID is required", success: false },
        { status: 400 }
      );
    }

    // Verify the customer current session
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    // Capture the PayPal order
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.prefer("return=representation");

    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        data: {
          captureId: capture.result.purchase_units[0].payments.captures[0].id,
          status: capture.result.status,
          amount:
            capture.result.purchase_units[0].payments.captures[0].amount.value,
          currency:
            capture.result.purchase_units[0].payments.captures[0].amount
              .currency_code,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Payment capture failed",
          success: false,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json(
      {
        error: "Failed to capture PayPal order",
        success: false,
      },
      { status: 500 }
    );
  }
}
