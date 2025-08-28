// @ts-ignore - PayPal checkout SDK doesn't have official types
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

// Configure PayPal environment
// For now, use Sandbox in both development and production
// Change to LiveEnvironment when you have live PayPal credentials
const environment =
  process.env.PAYPAL_USE_LIVE === "true"
    ? new checkoutNodeJssdk.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID ||
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new checkoutNodeJssdk.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID ||
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      );

export const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(
  environment
);

export const formatAmountForPayPal = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatAmountFromPayPal = (amount: string): number => {
  return parseFloat(amount);
};
