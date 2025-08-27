"use client";
import { lato, orbitron, poppins } from "@/fonts/fonts";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import WhiteLoader from "@/components/ui/WhiteLoader";
import OverlayLoader from "@/components/ui/OverlayLoader";
import { useStore } from "@/store/useStore";
import SafeImage from "@/components/ui/SafeImage";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subpackageId = params?.subpackageId;
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [currentELO, setCurrentELO] = useState(0);
  const [targetELO, setTargetELO] = useState(0);
  // const [subpackage, setSubpackage] = useState({});

  const [subpackage, setSubpackage] = useState<{ price?: number } | any>({});
  const [finalPrice, setFinalPrice] = useState(0);
  const router = useRouter();
  const store = useStore();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  // Improved loading and fetch logic
  useEffect(() => {
    // Only fetch if email is available just checking for loggedin status
    if (!store.user?.email) return;

    console.log(
      "Fetching package and creating intent...",
      searchParams?.get("rankName")
    );
    console.log(
      "Fetching package and creating intent...",
      searchParams?.get("numberOfGames")
    );
    console.log(
      "Fetching package and creating intent...",
      searchParams?.get("numberOfTeammates")
    );

    async function fetchPackageAndCreateIntent() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/create-payment-intent?subpackageId=${subpackageId}&email=${
            store.user?.email
          }&rankName=${searchParams?.get("rankName") || ""}&numberOfGames=${
            searchParams?.get("numberOfGames") || ""
          }&numberOfTeammates=${searchParams?.get("numberOfTeammates") || ""}`,
          { method: "GET" }
        );

        const intentResponse = await response.json();
        if (!intentResponse?.success) {
          setPageError(
            intentResponse?.error || "Server responded with an error"
          );
          setLoading(false);
          return;
        }
        setClientSecret(intentResponse.data.clientSecret);
        setSubpackage(intentResponse.data.subpackage);
        console.log("fetched subpackage:", subpackage);
        setFinalPrice(intentResponse.data.finalPrice);
      } catch (error) {
        console.error(error);
        setPageError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchPackageAndCreateIntent();
  }, [store.user?.email, subpackageId]);

  // Show loader if loading or email is not yet available
  if (loading || !store.user?.email) {
    return <OverlayLoader />;
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl text-white font-bold mb-4">
          Something went wrong
        </h1>
        <p className="mb-6 text-gray-100">Please try again or go back.</p>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-gradient-to-r  from-pink-500 via-purple-400 to-cyan-400 transition-all text-white rounded hover:scale-105"
        >
          Go Back
        </button>
      </div>
    );
  }

  //-----------------------------
  // rendering the return response
  //---------------------------
  return (
    <div className="Checkout p-8 max-w-[1300px] justify-between mx-auto w-full ">
      <div className="flex items-center xs:gap-14 gap-4 ">
        <img
          width={"20px"}
          src="/images/leftarrow.png"
          alt="back icon"
          onClick={() => router.back()}
        />
        <h2
          className={`uppercase text-[30px] ${orbitron.className} font-bold text-3xl`}
        >
          Diffed.gg
        </h2>
      </div>

      <div className="w-full lg:grid lg:grid-cols-2">
        <div className="data mt-20">
          {/* card for package info */}
          <div
            className="card w-full mx-auto xl:w-[90%] rounded-lg min-h-[370px] overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <SafeImage
              // @ts-ignore
              src={subpackage.service.game.image as string | undefined}
              placeholder="/images/placeholder.png"
              alt="Checkout subpackage image"
              className="absolute top-0 w-full h-full -z-1 right-0  fade-mask-ltr object-cover"
            />
            <div className="pl-4 mt-16">
              <h3
                className={`bg-gradient-to-r uppercase font-bold text-[27px] inline from-[#EE2C81] via-[#FE0FD0] to-[#58B9E3] bg-clip-text text-transparent tracking-wide leading-tight ${orbitron.className}`}
              >
                {/* @ts-ignore */}
                {subpackage?.service?.game?.name}
              </h3>
              <h3
                className={`${orbitron.className} uppercase text-[27px] text-white font-bold tracking-wide leading-tight`}
              >
                Subscription
              </h3>
            </div>
            <div
              className={`benifits mt-5 pl-4 text-[24px] list-disc list-inside ${lato.className} font-[400]`}
              style={{ lineHeight: "200%" }}
            >
              {/* @ts-ignore */}
              <div>{subpackage.name}</div>
            </div>
          </div>

          {/* Price breakdown info */}
          <div className="mt-12">
            <h4
              className={`text-2xl font-bold text-white mb-6 ${orbitron.className}`}
            >
              Price Breakdown
            </h4>
            <div
              className="rounded-xl p-6 backdrop-blur-sm border border-white/20"
              style={{
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <div className="space-y-4">
                {/* ELO Range - only if dynamic pricing */}
                {subpackage.dynamicPricing && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/10">
                    <span className={`text-gray-300 text-lg ${lato.className}`}>
                      ELO Range
                    </span>
                    <span className="text-cyan-400 font-semibold text-lg">
                      {`${subpackage.minELO} - ${subpackage.maxELO}`}
                    </span>
                  </div>
                )}

                {/* Base Service */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/10">
                  <span className={`text-gray-300 text-lg ${lato.className}`}>
                    Base Service
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    ${subpackage.price}
                  </span>
                </div>

                {/* Rank Name - only if selected */}
                {searchParams?.get("rankName") && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/10">
                    <span className={`text-gray-300 text-lg ${lato.className}`}>
                      Selected Rank
                    </span>
                    <span className="text-pink-400 font-semibold text-lg inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      {searchParams.get("rankName")}
                    </span>
                  </div>
                )}

                {/* Number of Games */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/10">
                  <span className={`text-gray-300 text-lg ${lato.className}`}>
                    Number of Games
                  </span>
                  <span className="text-purple-400 font-semibold text-lg inline-flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {searchParams?.get("numberOfGames")} game
                    {Number(searchParams?.get("numberOfGames")) > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Number of Teammates */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-white/10">
                  <span className={`text-gray-300 text-lg ${lato.className}`}>
                    Number of Teammates
                  </span>
                  <span className="text-blue-400 font-semibold text-lg inline-flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    {searchParams?.get("numberOfTeammates")} teammate
                    {Number(searchParams?.get("numberOfTeammates")) > 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                {/* Total - highlighted */}
                <div className="mt-6 pt-4 border-t-2 border-gradient-to-r from-pink-500 to-cyan-400">
                  <div
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 rounded-lg px-4"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(238, 44, 129, 0.1) 0%, rgba(88, 185, 227, 0.1) 100%)",
                    }}
                  >
                    <span
                      className={`text-white text-xl font-bold ${orbitron.className}`}
                    >
                      Total Amount
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      ${finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="form w-full mt-20 lg:mt-0 lg:ml-10 lg:justify-self-start xl:justify-self-end ">
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: "USD",
            }}
          >
            {clientSecret && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  numberOfGames={Number(searchParams?.get("numberOfGames"))}
                  numberOfTeammates={Number(
                    searchParams?.get("numberOfTeammates")
                  )}
                  rankName={searchParams?.get("rankName") || ""}
                  subpackage={subpackage}
                  finalPrice={finalPrice}
                  clientSecret={clientSecret}
                />
              </Elements>
            )}
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
}
