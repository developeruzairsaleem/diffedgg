import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // This endpoint helps debug environment variables in deployment
    // Remove this endpoint after debugging is complete

    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ? "SET" : "NOT SET",
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
        ? "SET"
        : "NOT SET",
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
        ? "SET"
        : "NOT SET",
      PAYPAL_USE_LIVE: process.env.PAYPAL_USE_LIVE || "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      PAYPAL_ENVIRONMENT:
        process.env.PAYPAL_USE_LIVE === "true" ? "LIVE" : "SANDBOX",
    };

    console.log("Environment variables check:", envCheck);

    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in debug-env:", error);
    return NextResponse.json(
      {
        error: "Failed to check environment",
        details: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}
