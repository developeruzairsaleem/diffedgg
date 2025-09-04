import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ResetPasswordFormSchema } from "@/lib/definitions";
import { createSession } from "@/lib/sessions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate form fields
    const validatedFields = ResetPasswordFormSchema.safeParse({
      token: body.token,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid form data. Please check your inputs." },
        { status: 400 }
      );
    }

    const { token, password } = validatedFields.data;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    // Create a new session for the user after successful password reset
    await createSession(user.id, user.role);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset.",
      // user: {
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      //   role: user.role,
      // },
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}