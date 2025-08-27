"use client";
import { lato, poppins } from "@/fonts/fonts";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
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

  const handlePayPalPayment = async (data: FormData) => {
    if (!paypalOrderId) {
      setError("PayPal order not created. Please try again.");
      return;
    }

    try {
      // Capture the PayPal payment
      const captureRes = await fetch("/api/capture-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: paypalOrderId }),
      });

      const captureJson = await captureRes.json();
      if (!captureJson.success) {
        setError(captureJson.error || "PayPal payment capture failed");
        return;
      }

      await createOrder(
        data,
        "paypal",
        undefined,
        paypalOrderId,
        captureJson.data.captureId
      );
    } catch (err) {
      setError("PayPal payment failed. Please try again or contact support.");
    }
  };

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
        await handlePayPalPayment(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    try {
      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subpackageId: subpackage.id,
          customerEmail: "customer@example.com", // This should come from user context
          currentELO,
          targetELO,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPaypalOrderId(result.data.orderId);
        return result.data.orderId;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError("Failed to create PayPal order");
      throw error;
    }
  };

  const onPayPalApprove = async (data: any, actions: any) => {
    try {
      const orderId = await createPayPalOrder();
      if (orderId) {
        // The payment will be captured in the PayPal button's onApprove
        return actions.order.capture();
      }
    } catch (error) {
      setError("PayPal order creation failed");
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
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
                className="mr-2"
              />
              <span className="text-white">Credit Card (Stripe)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
                className="mr-2"
              />
              <span className="text-white">PayPal</span>
            </label>
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
        {paymentMethod === "paypal" && (
          <div className="mb-6">
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: "USD",
              }}
            >
              <PayPalButtons
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                style={{ layout: "horizontal" }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {(error || cardError) && (
          <div className="text-pink-500 mb-4 text-sm">{error || cardError}</div>
        )}

        <button
          type="submit"
          className="py-6 text-center w-full bg-gradient-to-r rounded-full from-pink-500 via-purple-400 to-cyan-400 hover:scale-105 transition-all cursor-pointer text-white text-[24px] mt-16 disabled:opacity-50"
          disabled={
            !isValid ||
            loading ||
            isSubmitting ||
            (paymentMethod === "paypal" && !paypalOrderId)
          }
        >
          {loading || isSubmitting ? "Processing..." : "Subscribe"}
        </button>
      </div>
    </Form>
  );
}
