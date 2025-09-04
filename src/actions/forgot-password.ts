"use server";
import { ForgotPasswordFormSchema } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function requestPasswordReset(state: any, formData: FormData) {
  try {
    // Validate form fields
    const validatedFields = ForgotPasswordFormSchema.safeParse({
      email: formData.get("email"),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: {
          message: "Please enter a valid email address.",
        },
      };
    }

    const { email } = validatedFields.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, we don't reveal if the email exists or not
    // Always return success message
    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      };
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

    // TODO: Send email with reset link
    // For now, we'll just log the token (in production, you'd send an email)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return {
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      errors: {
        message: "Something went wrong. Please try again later.",
      },
    };
  }
}