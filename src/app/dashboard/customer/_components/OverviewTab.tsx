import {
  Package,
  Activity,
  CheckCircle,
  DollarSign,
  Clock,
  XCircle,
  AlertCircle,
  Inbox,
  TrendingUp,
  User,
  ShoppingCart,
  Star,
  Calendar,
  ArrowRight,
  Eye,
  Gamepad2,
  Trophy,
  Target,
  Zap,
  Crown,
  ChevronRight,
} from "lucide-react";
import { useCustomerOrders } from "@/hooks/useOrders";
import { useStore } from "@/store/useStore";
import { CustomerOrderListDto } from "@/types/order.dto";
import Link from "next/link";
import React, { useMemo } from "react";

import SafeImage from "@/components/ui/SafeImage";

import { orbitron } from "@/fonts/fonts";

// --- Helper Functions & Components ---

const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4" />;
    case "IN_PROGRESS":
      return <Activity className="w-4 h-4" />;
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/20 text-green-400 border-green-400";
    case "IN_PROGRESS":
      return "bg-blue-500/20 text-blue-400 border-blue-400";
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-400";
    case "CANCELLED":
      return "bg-red-500/20 text-red-400 border-red-400";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-400";
  }
};

const getProviderDisplay = (order: CustomerOrderListDto) => {
  const providers = order?.providers;
  if (!providers || providers.length === 0) return "No Providers Yet";

  const approvedProviders = providers.filter((p) =>
    ["APPROVED", "COMPLETED", "VERIFIED"].includes(p.status)
  );

  if (approvedProviders.length === 0) return "No Providers Yet";

  const first = approvedProviders[0].username;
  if (approvedProviders.length > 1) {
    return `${first} & ${approvedProviders.length - 1} more`;
  }
  return first;
};

const StatsCard = ({
  icon: Icon,
  title,
  value,
  trend,
  color,
  loading,
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: string;
  color: string;
  loading: boolean;
}) => {
  return (
    <div
      className="rounded-xl p-1 transition-all duration-300 hover:scale-105"
      style={{
        background:
          "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
      }}
    >
      <div className="bg-[#5E2047] rounded-xl p-6 h-full">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
            </div>
            <div className="h-4 w-20 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-600 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-300 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">
                  {trend}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WelcomeCard = ({ user, loading }: { user: any; loading: boolean }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div
      className="rounded-xl p-1 mb-8"
      style={{
        background:
          "linear-gradient(135deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
      }}
    >
      <div className="bg-[#5E2047] rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-gray-600 rounded mb-3"></div>
              <div className="h-5 w-96 bg-gray-600 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-gray-600 rounded-lg"></div>
                <div className="h-12 w-32 bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          ) : (
            <>
              <h1
                className={`${orbitron.className} text-3xl md:text-4xl font-bold text-white mb-3`}
              >
                {getGreeting()}, {user?.username || "Gamer"}! 👋
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Ready to level up your gaming experience? Check out your recent
                activity and discover new services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard/customer/orders"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  View All Orders
                </Link>
                <Link
                  href="/dashboard/customer/games"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Browse Games
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen p-3 sm:p-4 md:p-6 animate-pulse">
    <div className="max-w-7xl mx-auto">
      {/* Welcome Card Skeleton */}
      <div
        className="rounded-lg sm:rounded-xl p-1 mb-6 sm:mb-8"
        style={{
          background:
            "linear-gradient(135deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
        }}
      >
<
        <div className="bg-[#5E2047] rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="h-8 w-64 bg-gray-600 rounded mb-3"></div>
            <div className="h-5 w-96 bg-gray-600 rounded mb-6"></div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-12 w-32 bg-gray-600 rounded-lg"></div>
              <div className="h-12 w-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl p-1 transition-all duration-300"
            style={{
              background:
                "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
            }}
          >

            <div className="bg-[#5E2047] rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-600 rounded mb-1"></div>
                <div className="flex items-baseline justify-between">
                  <div className="h-8 w-16 bg-gray-600 rounded"></div>
                  <div className="h-5 w-12 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Orders Skeleton */}
        <div className="lg:col-span-2 flex flex-col">
          <div
            className="rounded-xl p-1 flex flex-col flex-1"
            style={{
              background:
                "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
            }}
          >
            <div className="bg-[#5E2047] rounded-xl flex flex-col flex-1">
              <div className="p-4 sm:p-6 border-b border-gray-600/30 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded"></div>
                    <div className="h-5 sm:h-6 w-32 bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-600 rounded"></div>
                </div>
              </div>

              {/* Desktop View Skeleton */}
              <div className="hidden lg:block p-6">
                <div className="overflow-hidden">
                  <div className="bg-gray-900/30 rounded-xl border border-gray-600/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-600/30">
                      <div className="grid grid-cols-12 gap-4 px-6 py-4">
                        <div className="col-span-3 h-4 bg-gray-600 rounded-md"></div>
                        <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                        <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                        <div className="col-span-3 h-4 bg-gray-600 rounded-md"></div>
                        <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                      </div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-700/30">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                        >
                          {/* Game & Service */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="h-4 w-24 bg-gray-600 rounded-md mb-2"></div>
                              <div className="h-3 w-20 bg-gray-600 rounded-md"></div>
                            </div>
                          </div>

                          {/* Package */}
                          <div className="col-span-2">
                            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                              <div className="h-4 w-20 bg-gray-600 rounded-md mb-2"></div>
                              <div className="h-3 w-16 bg-gray-600 rounded-md"></div>
                            </div>
                          </div>

                          {/* Price & Provider */}
                          <div className="col-span-2">
                            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                              <div className="h-5 w-16 bg-gray-600 rounded-md mb-2"></div>
                              <div className="h-3 w-20 bg-gray-600 rounded-md"></div>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-3 flex justify-center">
                            <div className="w-32 h-8 bg-gray-600 rounded-xl"></div>
                          </div>

                          {/* Action */}
                          <div className="col-span-2 flex justify-center">
                            <div className="w-24 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>

              {/* Tablet View Skeleton (md to lg) */}
              <div className="hidden md:block lg:hidden p-6">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-xl p-5 border border-gray-600/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gray-600 rounded-xl"></div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-gray-600 rounded-md mb-2"></div>
                          <div className="h-4 w-40 bg-gray-600 rounded-md"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 w-20 bg-gray-600 rounded-md mb-1"></div>
                          <div className="h-3 w-16 bg-gray-600 rounded-md"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="h-8 w-24 bg-gray-600 rounded-xl"></div>
                        <div className="h-10 w-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile View Skeleton */}
              <div className="md:hidden p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-600 rounded"></div>
                      </div>
                      <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="h-4 w-16 bg-gray-600 rounded mb-1"></div>
                        <div className="h-3 w-20 bg-gray-600 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="h-5 w-12 bg-gray-600 rounded-full"></div>
                        <div className="h-5 w-12 bg-gray-600 rounded-full"></div>
                        <div className="h-9 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="">
          <div
            className="rounded-xl p-1 h-full"
            style={{
              background:
                "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
            }}
          >
            <div className="bg-[#5E2047] rounded-xl h-full p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
                <div className="h-6 w-32 bg-gray-600 rounded"></div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-8 bg-gray-800/30 rounded-lg border border-gray-600/30"
                  >
                    <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const OverviewTab = () => {
  const { user } = useStore();
  const { data: ordersData, loading: loadingOrders } = useCustomerOrders({
    customerId: user?.id,
    page: 1,
    limit: 5, // Only show recent 5 orders
  });

  // Calculate enhanced stats
  const stats = useMemo(() => {
    if (!ordersData)
      return { total: 0, active: 0, completed: 0, totalSpent: 0, pending: 0 };

    return {
      total: ordersData.total || 0,
      active:
        ordersData.orders?.filter(
          (o: CustomerOrderListDto) => o.status === "IN_PROGRESS"
        ).length || 0,
      completed:
        ordersData.orders?.filter(
          (o: CustomerOrderListDto) => o.status === "COMPLETED"
        ).length || 0,
      pending:
        ordersData.orders?.filter(
          (o: CustomerOrderListDto) => o.status === "PENDING"
        ).length || 0,
      totalSpent:
        ordersData.orders?.reduce(
          (sum: number, order: CustomerOrderListDto) =>
            sum + (order.price || 0),
          0
        ) || 0,
    };
  }, [ordersData]);

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.total,
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-400",
      trend: stats.total > 0 ? "+12%" : undefined,
    },
    {
      title: "Active Orders",
      value: stats.active,
      icon: Activity,
      color: "from-orange-500 to-amber-400",
      trend: stats.active > 0 ? "In Progress" : undefined,
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-400",
      trend: stats.completed > 0 ? "Success" : undefined,
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-400",
      trend: stats.totalSpent > 0 ? "" : undefined,
    },
  ];

  const quickActions = [
    {
      title: "Browse Games",
      icon: Gamepad2,
      href: "/dashboard/customer/games",
      color: "from-pink-500 to-purple-600",
    },
    {
      title: "View All Orders",
      icon: Package,
      href: "/dashboard/customer/orders",
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Wallet & Billing",
      icon: DollarSign,
      href: "/dashboard/customer/wallet",
      color: "from-green-500 to-emerald-400",
    },
    {
      title: "Reviews",
      icon: User,
      href: "/dashboard/customer/reviews",
      color: "from-orange-500 to-amber-400",
    },
  ];

  if (loadingOrders) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <WelcomeCard user={user} loading={loadingOrders} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <StatsCard key={index} {...card} loading={loadingOrders} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 flex flex-col">
            <div
              className="rounded-xl p-1 flex flex-col flex-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-xl flex flex-col flex-1">
                <div className="p-4 sm:p-6 border-b border-gray-600/30 flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                      <h2
                        className={`${orbitron.className} text-lg sm:text-xl font-bold text-white`}
                      >
                        Recent Activity
                      </h2>
                    </div>
                    {/* @ts-ignore */}
                    {ordersData?.orders?.length > 0 && (
                      <Link
                        href="/dashboard/customer/orders"
                        className="text-pink-400 hover:text-pink-300 text-sm font-medium flex items-center gap-1 transition-colors self-start sm:self-center"
                      >
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {!ordersData?.orders?.length ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-8 h-8 text-white" />
                    </div>
                    <h3
                      className={`${orbitron.className} text-xl font-bold text-white mb-2`}
                    >
                      No Orders Yet
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Start your gaming journey by placing your first order!
                    </p>
                    <Link
                      href="/dashboard/customer/games"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
                    >
                      <Gamepad2 className="w-5 h-5" />
                      Browse Games
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Desktop View */}
                    <div className="hidden lg:block p-6">
                      <div className="overflow-hidden">
                        {/* Modern Table Container */}
                        <div className="bg-gray-900/30 rounded-xl border border-gray-600/20 overflow-hidden">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-600/30">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-300 text-xs uppercase tracking-wider font-semibold">
                              <div className="col-span-3">Game & Service</div>
                              <div className="col-span-2">Package</div>
                              <div className="col-span-2 text-center">
                                Price & Provider
                              </div>
                              <div className="col-span-3 text-center">
                                Status
                              </div>
                              <div className="col-span-2 text-center">
                                Action
                              </div>
                            </div>
                          </div>

                          {/* Table Body */}
                          <div className="divide-y divide-gray-700/30">
                            {ordersData.orders.map(
                              (order: CustomerOrderListDto) => (
                                <div
                                  key={order.id}
                                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-gray-800/10 hover:bg-gray-800/30 transition-all duration-200 group"
                                >
                                  {/* Game & Service */}
                                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                                    <div className="relative">
                                      <SafeImage
                                        src={
                                          order?.subpackage?.service?.game
                                            ?.image || "/logo/logo.png"
                                        }
                                        alt={
                                          order?.subpackage?.service?.game?.name
                                        }
                                        placeholder="/images/placeholder.png"
                                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-600/30 group-hover:ring-pink-500/30 transition-all duration-200"
                                      />
                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <Gamepad2 className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-white text-sm group-hover:text-pink-300 transition-colors truncate">
                                        {order?.subpackage?.service?.game?.name}
                                      </h4>
                                      <p className="text-gray-400 text-xs truncate">
                                        {order?.subpackage?.service?.name}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Package */}
                                  <div className="col-span-2 min-w-0">
                                    <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                                      <p className="text-gray-200 text-sm font-medium truncate">
                                        {order?.subpackage?.name}
                                      </p>
                                      <p className="text-gray-400 text-xs mt-1">
                                        {order?.subpackage?.duration ||
                                          "Standard"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Price & Provider */}
                                  <div className="col-span-2 text-center">
                                    <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                                      <p className="text-white font-bold text-lg">
                                        ${order?.price.toFixed(2)}
                                      </p>
                                      <p className="text-gray-400 text-xs truncate mt-1">
                                        {getProviderDisplay(order)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div className="col-span-3 flex justify-center">
                                    <div className="w-full max-w-[160px]">
                                      <span
                                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 border backdrop-blur-sm ${getStatusColor(
                                          order.status
                                        )}`}
                                      >
                                        {getStatusIcon(order.status)}
                                        <span className="capitalize">
                                          {order.status
                                            .replace("_", " ")
                                            .toLowerCase()}
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Action */}
                                  <div className="col-span-2 flex justify-center">
                                    <Link
                                      href={
                                        order.status === "PENDING"
                                          ? `/dashboard/customer/orders/${order.id}/pending`
                                          : `/dashboard/customer/orders/${order.id}`
                                      }
                                      className="w-full max-w-[100px] px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-pink-500/25"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span className="hidden xl:inline">
                                        View
                                      </span>
                                    </Link>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tablet View (md to lg) */}
                    <div className="hidden md:block lg:hidden p-6">
                      <div className="space-y-4">
                        {ordersData.orders.map(
                          (order: CustomerOrderListDto) => (
                            <div
                              key={order.id}
                              className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-xl p-5 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-200 backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                  <SafeImage
                                    src={
                                      order?.subpackage?.service?.game?.image ||
                                      "/logo/logo.png"
                                    }
                                    alt={order?.subpackage?.service?.game?.name}
                                    placeholder="/images/placeholder.png"
                                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-600/30"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <Gamepad2 className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-lg mb-1">
                                    {order?.subpackage?.service?.game?.name}
                                  </h4>
                                  <p className="text-gray-300 text-sm">
                                    {order?.subpackage?.service?.name} •{" "}
                                    {order?.subpackage?.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold text-xl">
                                    ${order?.price.toFixed(2)}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {getProviderDisplay(order)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2 border ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getStatusIcon(order.status)}
                                  <span className="capitalize">
                                    {order.status
                                      .replace("_", " ")
                                      .toLowerCase()}
                                  </span>
                                </span>
                                <Link
                                  href={
                                    order.status === "PENDING"
                                      ? `/dashboard/customer/orders/${order.id}/pending`
                                      : `/dashboard/customer/orders/${order.id}`
                                  }
                                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Order
                                </Link>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden p-4 space-y-4">
                      {ordersData.orders.map((order: CustomerOrderListDto) => (
                        <div
                          key={order.id}
                          className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <SafeImage
                              src={
                                order?.subpackage?.service?.game?.image ||
                                "/logo/logo.png"
                              }
                              alt={order?.subpackage?.service?.game?.name}
                              placeholder="/images/placeholder.png"
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-sm">
                                {order?.subpackage?.service?.game?.name}
                              </h4>
                              <p className="text-gray-400 text-xs">
                                {order?.subpackage?.service?.name}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="capitalize">
                                {order.status.replace("_", " ").toLowerCase()}
                              </span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-semibold">
                                ${order?.price.toFixed(2)}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {getProviderDisplay(order)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap max-w-[50%] justify-end">
                              {order?.gamesCount != null &&
                                order.gamesCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    <Gamepad2 className="w-3 h-3" />
                                    <span>{order.gamesCount}</span>
                                  </span>
                                )}
                              {order?.requiredCount != null &&
                                order.requiredCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <User className="w-3 h-3" />
                                    <span>{order.requiredCount}</span>
                                  </span>
                                )}
                              {order?.rank?.name && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  <Crown className="w-3 h-3" />
                                  <span>
                                    {order.rank.name}
                                    {typeof order?.rank?.additionalCost ===
                                      "number" && order.rank.additionalCost > 0
                                      ? ` +$${order.rank.additionalCost}`
                                      : ""}
                                  </span>
                                </span>
                              )}
                              {order?.subpackage?.dynamicPricing &&
                                order?.subpackage?.minELO != null &&
                                order?.subpackage?.maxELO != null && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    <Target className="w-3 h-3" />
                                    <span>
                                      {order.subpackage.minELO}-
                                      {order.subpackage.maxELO}
                                    </span>
                                  </span>
                                )}
                            </div>
                            <Link
                              href={
                                order.status === "PENDING"
                                  ? `/dashboard/customer/orders/${order.id}/pending`
                                  : `/dashboard/customer/orders/${order.id}`
                              }
                              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="">
            <div
              className="rounded-xl p-1 h-full"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-xl h-full p-6">
                <h3
                  className={`${orbitron.className} text-xl font-bold text-white mb-6 flex items-center gap-2`}
                >
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex items-center gap-4 p-8  bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200 border border-gray-600/30 group"
                    >
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium group-hover:text-pink-300 transition-colors">
                          {action.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewTab;
