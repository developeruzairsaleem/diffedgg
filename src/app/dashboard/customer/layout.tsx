"use client";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { lato, orbitron } from "@/fonts/fonts";
import {
  User,
  Wallet,
  Star,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Settings,
  Home,
  Gamepad2,
  LogOut,
  Menu,
  Clock,
} from "lucide-react";
import { Toaster } from "sonner";

const Dashboard = ({ children }: { children: React.ReactNode }) => {
  const store = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Effect for getting the user dashboard info
  useEffect(() => {
    async function getCustomerDashboard() {
      // API response
      try {
        const user = await fetch("/api/user/me").then((res) => res.json());
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email,
          isLoggedIn: true,
          role: user.role,
        };
        store.setUser(userData);
        const wallet = await fetch("/api/wallet").then((res) => res.json());

        const walletData = {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
        };
        store.setWallet(walletData);
        const tx = await fetch("/api/transaction/me").then((res) => res.json());
        const txData = tx.map((idTx: any) => {
          return {
            id: idTx.id,
            type: idTx.type,
            amount: idTx.amount,
            walletId: idTx.walletId,
            createdAt: idTx.createdAt,
            description: idTx.description,
            status: idTx.status,
            paymentMethod: idTx.paymentMethod,
          };
        });
        store.setTransactions(txData);
      } catch (error) {
        console.log("error getting customer dashboard");
        console.log(error);
      }
    }

    getCustomerDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        message.success("You have been successfully logged out.");
        // Redirect to the login page or home page after logout
        router.push("/");
      } else {
        message.error(data.error || "Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error("An unexpected error occurred during logout.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
        return <Activity className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const navItems = [
    { href: "/dashboard/customer/", icon: Home, label: "Overview" },
    { href: "/dashboard/customer/games/", icon: Gamepad2, label: "Games" },
    { href: "/dashboard/customer/orders/", icon: Package, label: "Orders" },
    { href: "/dashboard/customer/wallet/", icon: Wallet, label: "Wallet" },
    { href: "/dashboard/customer/reviews/", icon: Star, label: "Reviews" },
    // { href: "/dashboard/customer/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="bg-transparent h-full text-gray-200">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#3a0f2a] z-50 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-white rounded-md hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <Image src="/logo/logo.png" alt="logo" width="70" height="70" />
              <div
                className={`text-2xl uppercase ${orbitron.className} font-bold text-white hidden md:block`}
              >
                Diffed.gg
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                ${store.wallet?.balance || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-md font-semibold text-gray-100 hidden sm:block">
                {store.user?.username || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-32 md:pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed top-16 bottom-0 left-0 z-40 bg-[#2a0a1e] transition-all duration-300 ease-in-out hidden md:block ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="h-full flex flex-col">
            <nav className=" sm:flex-grow p-2 space-y-1 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-white/10 transition-colors ${
                    pathname === item.href ? "bg-white/15" : ""
                  } ${!isSidebarOpen && "justify-center"}`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-2 border-t border-white/10">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-white/10 transition-colors ${
                  !isSidebarOpen && "justify-center"
                }`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="whitespace-nowrap">Logout</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={` flex-1 transition-all duration-300 ease-in-out ml-0 overflow-x-auto ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
        >
          <div className="h-[calc(100vh-4rem)] ">
            <div className="p-4 sm:p-6 lg:p-8 pb-0">{children}</div>
          </div>
        </main>

        {/* Mobile Top Navigation */}
        <nav className="fixed top-16 left-0 right-0 z-40 bg-[#2a0a1e] border-b border-white/10 md:hidden">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center ${
                  pathname === item.href ? "text-white" : "text-white/70"
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center text-white/90"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] mt-1">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
