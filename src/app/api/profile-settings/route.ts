import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/sessions";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ProfileSchema } from "@/validations/profile.validator";

// GET handler to fetch current user data
export const GET = async () => {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      // Select only the fields the client needs to see
      select: {
        username: true,
        email: true,
        bio: true,
        profileImage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings." },
      { status: 500 }
    );
  }
};

// POST handler to update user data
export const POST = async (request: NextRequest) => {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body with Zod
    const validation = ProfileSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map((error) => `${error.path.join(".")}: ${error.message}`)
        .join("; ");
      return NextResponse.json(
        { error: `Validation failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    const { username, email, bio, profileImage } = validation.data;

    // Check if the new username or email is already taken by ANOTHER user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: { id: session.userId }, // Crucially, exclude the current user from the check
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 409 }
        ); // 409 Conflict
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email is already in use." },
          { status: 409 }
        );
      }
    }

    // If checks pass, update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.userId as string },
      data: {
        username,
        email,
        bio,
        profileImage,
      },
      select: {
        username: true,
        email: true,
        bio: true,
        profileImage: true,
      }, // Return the updated data
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings." },
      { status: 500 }
    );
  }
};
