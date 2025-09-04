import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { ForgotPasswordFormSchema } from "@/lib/definitions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate form fields
    const validatedFields = ForgotPasswordFormSchema.safeParse({
      email: body.email,
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, we don't reveal if the email exists or not
    // Always return success message
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        console.error(`Failed to send password reset email to ${email}`);
        // Still return success for security reasons (don't reveal if email exists)
      } else {
        console.log(`Password reset email sent successfully to ${email}`);
      }
    } catch (emailError) {
      console.error(`Error sending password reset email to ${email}:`, emailError);
      // Continue execution - don't fail the request due to email issues
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}