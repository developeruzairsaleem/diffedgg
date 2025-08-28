"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, UploadCloud, CheckCircle } from "lucide-react";
import { SettingsTab } from "./components/notification-settings";
import { message } from "antd";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setWallet, setTransactions } = useStore();
  // -----------------------------------------------------
  // Effect for getting the provider dashboard info safely
  // ----------------------------------------------------
  useEffect(() => {
    const getProviderDashboard = async () => {
      try {
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          isLoggedIn: true,
          role: userData.role,
          avatar: userData.profileImage,
          status: userData.status,
        });

        const walletRes = await fetch("/api/wallet");
        if (!walletRes.ok) throw new Error("Failed to fetch wallet");
        const walletData = await walletRes.json();
        setWallet({
          id: walletData.id,
          balance: walletData.balance,
          currency: walletData.currency,
        });

        const txRes = await fetch("/api/transaction/me");
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        const txData = await txRes.json();
        setTransactions(
          txData.map((idTx: any) => ({
            id: idTx.id,
            type: idTx.type,
            amount: idTx.amount,
            walletId: idTx.walletId,
            createdAt: idTx.createdAt,
            description: idTx.description,
            status: idTx.status,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    getProviderDashboard();
  }, [setUser, setWallet, setTransactions]);

  const isInactiveProvider = useMemo(() => {
    return user?.role === "provider" && (user as any)?.status !== "active";
  }, [user]);
  const [showForm, setShowForm] = useState(false);
  if (isInactiveProvider) {
    const applied =
      typeof window !== "undefined" &&
      localStorage.getItem("provider_verification_applied") === "1";

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className="w-full max-w-2xl rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(135deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
          }}
        >
          <div className="bg-[#5E2047] rounded-2xl p-8">
            {applied ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-yellow-300" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Waiting for verification
                </h1>
                <p className="text-gray-200 mb-2">
                  Your information has been submitted. An admin will review and
                  activate your account.
                </p>
                <p className="text-gray-400 text-sm">
                  You can check back later and refresh this page.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-yellow-300" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Provider verification required
                  </h1>
                  <p className="text-gray-200 mb-4">
                    Please complete your profile with a bio and profile photo.
                    After submission, an admin will verify your account.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Complete Profile
                  </button>
                </div>
                {showForm && (
                  <div className="p-4">
                    <SettingsTab type="isVerification" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return <div>{children}</div>;
}
