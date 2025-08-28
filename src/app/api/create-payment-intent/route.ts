import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    //   verify required Data
    const { searchParams } = new URL(req.url);

    const packageId: string = searchParams?.get("subpackageId") || "";
    const customerEmail: string = searchParams?.get("email") || "";
    const rankName: string = searchParams?.get("rankName") || "";
    const numberOfGames: number = Number(searchParams?.get("numberOfGames"));
    const numberOfTeammates: number = Number(
      searchParams?.get("numberOfTeammates")
    );

    if (!packageId || !customerEmail || !numberOfGames || !numberOfTeammates) {

      return NextResponse.json(
        { error: "DATA NOT PROVIDED for query params", success: false },
        { status: 400 }
      );
    }

    // verify the customer current session

    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        {
          status: 401,
        }
      );
    }

    // get the packageItem from DB
    const subpackage = await prisma.subpackage.findFirst({
      where: {
        id: packageId,
      },
      include: {
        service: {
          include: {
            game: true,
          },
        },
      },
    });

    console.log("Backend Fetched Subpackage:", subpackage);
    // if no package found return
    if (!subpackage) {
      return NextResponse.json(
        { error: "can't find the package", success: false },
        { status: 400 }
      );
    }
    let totalPriceInCents = subpackage.price! * 100;
    // calculate price in cents

    if (rankName) {
      totalPriceInCents +=
        (subpackage.ranks as any[])?.find((rank: any) => rank.name === rankName)
          ?.additionalCost * 100 || 0;
    }

    if (numberOfGames) {
      totalPriceInCents *= numberOfGames;
    }
    if (subpackage.type === "pergame") {
      totalPriceInCents *= subpackage.requiredProviders;
    } else if (subpackage.type === "perteammate") {
      totalPriceInCents *= numberOfTeammates;

    }

    // create a payment intent for the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPriceInCents),
      currency: "usd",
      receipt_email: customerEmail,
      description: `Order for ${customerEmail}`,
      metadata: {
        customerEmail,
        items: JSON.stringify([
          {
            subpackageId: subpackage.id,
            subpackageName: subpackage.name,
            subpackageDescription: subpackage.description,
          },
        ]),
        rankName,
        numberOfGames: String(numberOfGames),
        numberOfTeammates: String(numberOfTeammates),
      },
    }); 

    //   Log for debugging (remove in production)
    console.log("Payment Intent Created:", {
      id: paymentIntent.id,
      amount: totalPriceInCents,
      items: [
        {
          subpackageId: subpackage.id,
          subpackageName: subpackage.name,
          subpackageDescription: subpackage.description,
        },
      ],
      email: customerEmail,
      rankName,
      numberOfGames,
      numberOfTeammates,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          amount: totalPriceInCents,
          currency: "usd",
          subpackage,
          rankName,
          numberOfGames,
          numberOfTeammates,
          finalPrice: Math.round(totalPriceInCents / 100),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "something went wrong in the api /api/create-payment-intent ",
      error
    );
    return NextResponse.json(
      {
        error: "Something went wrong creating intent",
        success: false,
      },
      { status: 500 }
    );
  }
}