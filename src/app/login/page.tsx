"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Check, ArrowLeft, Mail } from "lucide-react";
import { orbitron, roboto } from "@/fonts/fonts";
import Image from "next/image";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";

type FormValues = {
  email: string;
  password: string;
};

type ForgotPasswordFormValues = {
  email: string;
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const password = watch("password");

  const onSubmit = handleSubmit(async (data: FormValues) => {
    try {
      setSubmitting(true);
      setServerError("");
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await login("state", formData); // ✅ This will update `state`
      if (response?.errors?.message) {
        return setServerError(response?.errors?.message);
      }
      if (response?.user) {
        return response?.user?.role === "customer"
          ? router.push("/dashboard/customer")
          : router.push("/dashboard/provider");
      }
    } catch (error) {
      console.error("something went wront", error);
      setServerError("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  });

  const onForgotPasswordSubmit = handleSubmitForgot(async (data: ForgotPasswordFormValues) => {
    try {
      setForgotPasswordSubmitting(true);
      setForgotPasswordError("");
      setForgotPasswordMessage("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setForgotPasswordError(result.error || "Something went wrong");
        return;
      }

      setForgotPasswordMessage(result.message);
      resetForgotForm();
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotPasswordError("Something went wrong. Please try again.");
    } finally {
      setForgotPasswordSubmitting(false);
    }
  });

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordError("");
    setForgotPasswordMessage("");
    resetForgotForm();
  };

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
              {showForgotPassword ? "Reset Password" : "Login"}
            </h1>
            <p className={` ${roboto.className} text-gray-200 text-md`}>
              {showForgotPassword
                ? "Enter your email to receive a reset link"
                : "Welcome back"
              }
            </p>
          </div>

          {/* Conditional Form Rendering */}
          {!showForgotPassword ? (
            /* Login Form */
            <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Email
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg bg-transparent text-white placeholder:text-gray-300 focus:outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your email address"
                  autoComplete="off"
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 pr-24 border rounded-lg bg-transparent text-white placeholder:text-gray-300 focus:outline-none ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your password"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className=""
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-red-500 text-sm mt-2 mb-2">{serverError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 cursor-pointer transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Signing in..." : "Log in"}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 underline"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <div className="space-y-4">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>

              <form onSubmit={onForgotPasswordSubmit} className="space-y-4" autoComplete="off">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...registerForgot("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      })}
                      type="email"
                      className={`w-full px-4 py-3 pl-12 border rounded-lg bg-transparent text-white placeholder:text-gray-300 focus:outline-none ${
                        forgotErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email address"
                      autoComplete="off"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {forgotErrors?.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {forgotErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {forgotPasswordError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{forgotPasswordError}</p>
                  </div>
                )}

                {/* Success Message */}
                {forgotPasswordMessage && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 text-sm">{forgotPasswordMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={forgotPasswordSubmitting}
                  className={`w-full py-3 px-4 cursor-pointer transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 focus:outline-none ${
                    forgotPasswordSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {forgotPasswordSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
