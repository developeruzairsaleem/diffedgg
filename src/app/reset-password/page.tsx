"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Check } from "lucide-react";
import { orbitron, roboto } from "@/fonts/fonts";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

function ResetPasswordClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const onSubmit = handleSubmit(async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          style={{ padding: "2px" }}
          className="w-full bg-gradient-to-r rounded-2xl from-pink-500 via-purple-500 to-cyan-500 max-w-md"
        >
          <div className="bg-[#591741] rounded-2xl shadow-2xl p-8 space-y-6 text-center">
            <div className="flex my-5 justify-center mx-auto">
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={100}
                height={100}
                objectFit="cover"
              />
            </div>
            <div className="space-y-4">
              <Check className="w-16 h-16 text-green-400 mx-auto" />
              <h1
                className={`text-2xl font-bold text-white ${orbitron.className}`}
              >
                Password Reset Successful
              </h1>
              <p className={`${roboto.className} text-gray-200 text-md`}>
                Your password has been successfully reset. You will be
                redirected to the login page in a few seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        style={{ padding: "2px" }}
        className="w-full bg-gradient-to-r rounded-2xl from-pink-500 via-purple-500 to-cyan-500 max-w-md"
      >
        <div className="bg-[#591741] rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex my-5 justify-center mx-auto">
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={100}
                height={100}
                objectFit="cover"
              />
            </div>
            <h1
              className={`text-2xl font-bold text-white ${orbitron.className}`}
            >
              Reset Your Password
            </h1>
            <p className={`${roboto.className} text-gray-200 text-md`}>
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                    pattern: {
                      value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
                      message:
                        "Password must contain at least one letter, one number, and one special character",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg bg-transparent text-white placeholder:text-gray-300 focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your new password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg bg-transparent text-white placeholder:text-gray-300 focus:outline-none ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your new password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !token}
              className={`w-full py-3 px-4 cursor-pointer transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none ${
                submitting || !token ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
