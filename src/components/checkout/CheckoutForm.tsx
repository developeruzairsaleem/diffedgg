"use client";
import { lato, poppins } from "@/fonts/fonts";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@radix-ui/react-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { message } from "antd";

// Schema for the order
const schema = z.object({
  username: z.string().min(1, "Enter your Discord Username is required"),
  discordTag: z.string().min(1, "Enter Discord tag"),
  notes: z.string().optional(),
  cardholderName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CheckoutFormProps {
  subpackage: any;
  numberOfGames: number;
  numberOfTeammates: number;
  rankName: string;
  finalPrice: number;
  clientSecret?: string;
}

export default function CheckoutForm({
  subpackage,
  numberOfGames,
  numberOfTeammates,
  rankName,
  finalPrice,
  clientSecret,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const isPayPalEnabled = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">(
    "stripe"
  );
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, submitCount, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      discordTag: "",
      notes: "",
      cardholderName: "",
    },
  });

  const handleStripePayment = async (data: FormData) => {
    if (!stripe || !elements || !clientSecret) {
      setError("Stripe is not loaded or payment intent is missing");
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setCardError("Card number element not found");
      return;
    }

    const { paymentIntent, error: stripeError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: data.cardholderName,
          },
        },
      });

    if (stripeError) {
      setCardError(stripeError.message || "Payment error");
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      await createOrder(data, "stripe", paymentIntent.id);
    } else {
      setError("Payment was not successful. Please try again.");
    }
  };

  // PayPal payments are now handled directly in the onApprove callback

  const createOrder = async (
    data: FormData,
    method: "stripe" | "paypal",
    paymentIntentId?: string,
    paypalOrderId?: string,
    paypalCaptureId?: string
  ) => {
    try {
      message.success("Payment succeeded");
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subpackageId: subpackage.id,
          paymentIntentId: method === "stripe" ? paymentIntentId : undefined,
          paypalOrderId: method === "paypal" ? paypalOrderId : undefined,
          paypalCaptureId: method === "paypal" ? paypalCaptureId : undefined,
          paymentMethod: method,
          discordTag: data.discordTag,
          notes: data.notes,
          discordUsername: data.username,
          numberOfGames,
          numberOfTeammates,
          rankName,
          finalPrice,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        setError(
          orderJson.error || "Order creation failed. Please contact support."
        );
        return;
      }

      router.push(`/dashboard/customer/orders/${orderJson.data}/pending`);
    } catch (err) {
      setError("Order creation failed. Please try again or contact support.");
      message.error("Order Creation was not successful");
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setCardError(null);
    setLoading(true);

    try {
      if (paymentMethod === "stripe") {
        await handleStripePayment(data);
      } else {
        // PayPal payments are handled through the PayPal button's onApprove callback
        setError(
          "Please use the PayPal button above to complete your payment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    console.log("Creating PayPal order...");
    try {
      const requestData = {
        subpackageId: subpackage.id,
        customerEmail: "customer@example.com", // This should come from user context
        numberOfGames: numberOfGames || 1,
        numberOfTeammates: numberOfTeammates || 1,
        rankName: rankName || "",
      };

      console.log("PayPal order request data:", requestData);

      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      console.log("PayPal API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayPal API error response:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("PayPal order creation result:", result);

      if (result.success) {
        setPaypalOrderId(result.data.orderId);
        return result.data.orderId;
      } else {
        console.error("PayPal order creation error:", result);
        throw new Error(result.error || "Failed to create PayPal order");
      }
    } catch (error) {
      console.error("PayPal order creation failed:", error);
      setError("Failed to create PayPal order: " + (error as Error).message);
      throw error;
    }
  };

  const onPayPalApproveWithFormData = async (
    data: any,
    actions: any,
    formData: FormData
  ) => {
    console.log("PayPal onApprove called with data:", data);
    console.log("Form data:", formData);
    setLoading(true);

    try {
      // Capture the payment
      const captureDetails = await actions.order.capture();
      console.log("PayPal capture successful:", captureDetails);

      // Now create the order in our system
      await createOrder(
        formData,
        "paypal",
        undefined, // no stripe payment intent
        data.orderID, // PayPal order ID
        captureDetails.purchase_units[0].payments.captures[0].id // PayPal capture ID
      );
    } catch (error) {
      console.error("PayPal approval failed:", error);
      setError("PayPal payment processing failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full block lg:p-8 rounded-lg"
    >
      <div className="">
        <h3 className={`${poppins.className} w-full text-[24px] mb-8`}>
          Contact information
        </h3>

        <FormField name="name" className="mb-6">
          <FormLabel className="block text-white mb-2 text-[16px]">
            Name / Username (Discord)
          </FormLabel>
          <FormControl asChild>
            <input
              id="username"
              className={`w-full px-3 py-3 rounded border border-white bg-transparent text-[18px] text-white focus:outline-none ${lato.className}`}
              {...register("username")}
            />
          </FormControl>
          {(touchedFields.username || submitCount > 0) &&
            errors.username?.message && (
              <FormMessage className="text-pink-500 text-sm mt-1">
                {errors.username.message}
              </FormMessage>
            )}
        </FormField>

        <FormField name="discordTag" className="mb-6">
          <FormLabel className="block mb-2 text-[16px] text-white">
            Discord Tag
          </FormLabel>
          <FormControl asChild>
            <input
              id="discordTag"
              className={`w-full px-3 py-3 rounded border border-white bg-transparent text-[18px] text-white focus:outline-none ${lato.className}`}
              type="text"
              {...register("discordTag")}
            />
          </FormControl>
          {(touchedFields.discordTag || submitCount > 0) &&
            errors.discordTag?.message && (
              <FormMessage className="text-pink-500 text-sm mt-1">
                {errors.discordTag.message}
              </FormMessage>
            )}
        </FormField>

        <FormField name="notes" className="mb-6">
          <FormLabel className="block mb-2 text-[16px] text-white">
            Preferences / Notes (Optional)
          </FormLabel>
          <FormControl asChild>
            <input
              id="notes"
              className={`w-full px-3 py-3 rounded border border-white bg-transparent text-[18px] text-white focus:outline-none ${lato.className}`}
              type="text"
              {...register("notes")}
            />
          </FormControl>
          {(touchedFields.notes || submitCount > 0) &&
            errors.notes?.message && (
              <FormMessage className="text-pink-500 text-sm mt-1">
                {errors.notes.message}
              </FormMessage>
            )}
        </FormField>

        <h3 className={`${poppins.className} mt-24 text-[24px] mb-8`}>
          Payment method
        </h3>

        {/* Payment Method Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Payment Option */}
            <div
              className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
                paymentMethod === "stripe"
                  ? "border-pink-500 bg-gradient-to-br from-pink-500/10 to-purple-500/10 shadow-lg shadow-pink-500/20"
                  : "border-white/20 bg-white/5 hover:border-pink-300 hover:bg-white/10"
              }`}
              onClick={() => setPaymentMethod("stripe")}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    paymentMethod === "stripe"
                      ? "border-pink-500 bg-pink-500 shadow-lg shadow-pink-500/50"
                      : "border-white/40"
                  }`}
                >
                  {paymentMethod === "stripe" && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-lg font-semibold">
                      Credit Card
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        MC
                      </div>
                      <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        AE
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    Secure payment via Stripe
                  </p>
                  {paymentMethod === "stripe" && (
                    <div className="mt-2 flex items-center text-green-400 text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PayPal Payment Option */}
            {isPayPalEnabled && (
              <div
                className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-lg shadow-blue-500/20"
                    : "border-white/20 bg-white/5 hover:border-blue-300 hover:bg-white/10"
                }`}
                onClick={() => setPaymentMethod("paypal")}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/50"
                        : "border-white/40"
                    }`}
                  >
                    {paymentMethod === "paypal" && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-lg font-semibold">
                        PayPal
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="px-2 py-1 bg-blue-600 rounded text-white text-xs font-bold">
                          PayPal
                        </div>
                        <div className="px-2 py-1 bg-yellow-500 rounded text-black text-xs font-bold">
                          Pay Later
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      Pay with your PayPal account
                    </p>
                    {paymentMethod === "paypal" && (
                      <div className="mt-2 flex items-center text-green-400 text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stripe Payment Form */}
        {paymentMethod === "stripe" && clientSecret && (
          <>
            <div className="block mb-2 text-[18px] text-white">
              Card information
            </div>
            <div className="border border-white rounded-lg">
              <FormField name="cardNumber" className="">
                <FormControl asChild>
                  <div className="w-full border-b border-white text-[18px] text-white bg-transparent focus-within:ring-2 focus-within:ring-pink-500 px-5 py-5">
                    <CardNumberElement
                      options={{
                        style: {
                          base: {
                            color: "#fff",
                            fontFamily: lato.className,
                            fontSize: "18px",
                            "::placeholder": { color: "#fff8" },
                          },
                          invalid: { color: "#ff6b81" },
                        },
                      }}
                      onChange={(e) => {
                        if (e.error) setCardError(e.error.message || "");
                        else setCardError(null);
                      }}
                    />
                  </div>
                </FormControl>
              </FormField>

              <div className="flex w-full">
                <FormField name="cardExpiry" className="w-1/2">
                  <FormControl asChild>
                    <div
                      className={`w-full px-5 py-5 rounded text-[18px] text-white bg-transparent ${lato.className}`}
                    >
                      <CardExpiryElement
                        options={{
                          style: {
                            base: {
                              color: "#fff",
                              fontFamily: lato.className,
                              fontSize: "18px",
                              "::placeholder": { color: "#fff8" },
                            },
                            invalid: { color: "#ff6b81" },
                          },
                        }}
                        onChange={(e) => {
                          if (e.error) setCardError(e.error.message || "");
                          else setCardError(null);
                        }}
                      />
                    </div>
                  </FormControl>
                </FormField>

                <FormField name="cardCvc" className="w-1/2">
                  <FormControl asChild>
                    <div className="w-full px-5 py-5 rounded text-[18px] text-white bg-transparent focus-within:ring-2 focus-within:ring-pink-500">
                      <CardCvcElement
                        options={{
                          style: {
                            base: {
                              color: "#fff",
                              fontFamily: lato.className,
                              fontSize: "18px",
                              "::placeholder": { color: "#fff8" },
                            },
                            invalid: { color: "#ff6b81" },
                          },
                        }}
                        onChange={(e) => {
                          if (e.error) setCardError(e.error.message || "");
                          else setCardError(null);
                        }}
                      />
                    </div>
                  </FormControl>
                </FormField>
              </div>
            </div>

            <FormField name="cardholderName" className="mb-6">
              <FormLabel className="block mb-3 mt-8 text-[16px] text-white">
                Cardholder name (Optional)
              </FormLabel>
              <FormControl asChild>
                <input
                  className={`w-full px-3 py-3 rounded border border-white bg-transparent text-[18px] text-white focus:outline-none ${lato.className}`}
                  type="text"
                  {...register("cardholderName")}
                />
              </FormControl>
              {(touchedFields.cardholderName || submitCount > 0) &&
                errors.cardholderName?.message && (
                  <FormMessage className="text-pink-500 text-sm mt-1">
                    {errors.cardholderName.message}
                  </FormMessage>
                )}
            </FormField>
          </>
        )}

        {/* PayPal Payment Button */}
        {paymentMethod === "paypal" && isPayPalEnabled && (
          <div className="mb-8">
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <div className="mb-4">
                <h4 className="text-white font-semibold text-lg mb-2">
                  Complete Payment with PayPal
                </h4>
                <p className="text-gray-300 text-sm">
                  Click the button below to securely pay with PayPal
                </p>
              </div>
              <div className="paypal-button-container">
                <PayPalButtons
                  createOrder={createPayPalOrder}
                  onApprove={(data, actions) => {
                    // Get current form data before processing PayPal
                    const formData = {
                      username:
                        (
                          document.getElementById(
                            "username"
                          ) as HTMLInputElement
                        )?.value || "User",
                      discordTag:
                        (
                          document.getElementById(
                            "discordTag"
                          ) as HTMLInputElement
                        )?.value || "User Discord Tag",
                      notes:
                        (document.getElementById("notes") as HTMLInputElement)
                          ?.value || "",
                      cardholderName: "",
                    };
                    return onPayPalApproveWithFormData(data, actions, formData);
                  }}
                  onError={(err) => {
                    console.error("PayPal button error:", err);
                    setError(
                      "PayPal error occurred. Please try again or use credit card."
                    );
                  }}
                  onCancel={() => {
                    console.log("PayPal payment cancelled");
                    setError("PayPal payment was cancelled.");
                  }}
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "paypal",
                    height: 50,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-center text-gray-400 text-xs">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secured by PayPal
              </div>
            </div>
          </div>
        )}

        {(error || cardError) && (
          <div className="text-pink-500 mb-4 text-sm">{error || cardError}</div>
        )}

        {/* Only show submit button for Stripe payments */}
        {paymentMethod === "stripe" && (
          <button
            type="submit"
            className="py-6 text-center w-full bg-gradient-to-r rounded-full from-pink-500 via-purple-400 to-cyan-400 hover:scale-105 transition-all cursor-pointer text-white text-[24px] mt-16 disabled:opacity-50"
            disabled={!isValid || loading || isSubmitting}
          >
            {loading || isSubmitting ? "Processing..." : "Subscribe"}
          </button>
        )}

        {/* For PayPal, show instruction */}
        {paymentMethod === "paypal" && (
          <div className="text-center py-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center justify-center space-x-2 text-blue-400 text-lg font-medium">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Complete your payment using the PayPal button above</span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                You'll be redirected to PayPal to complete your transaction
                securely
              </p>
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
