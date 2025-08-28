"use client";
import {
  Package,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Inbox,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCustomerOrders } from "@/hooks/useOrders";
import { useStore } from "@/store/useStore";
import type { CustomerOrderListDto } from "@/types/order.dto";
import { useState, useMemo } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { orbitron } from "@/fonts/fonts";

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
      return "text-green-400 border-green-400 border-2 bg-green-500/10";
    case "IN_PROGRESS":
      return "text-blue-400 border-blue-400 border-2 bg-blue-500/10";
    case "PENDING":
      return "text-yellow-400 border-2 border-yellow-400 bg-yellow-500/10";
    case "CANCELLED":
      return "text-red-400 border-red-400 border-2 bg-red-500/10";
    default:
      return "text-gray-400 border-gray-400 border-2 bg-gray-500/10";
  }
};

// Enhanced responsive skeleton component
const ModernOrdersSkeleton = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>
            <div className="h-8 w-32 bg-gray-700 rounded-lg"></div>

          </div>
          <div className="h-4 sm:h-5 w-64 sm:w-72 md:w-80 bg-gray-700 rounded-md"></div>
        </div>


        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg sm:rounded-xl p-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-xl p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                    <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-600 rounded-md mb-1"></div>
                  <div className="h-8 w-16 bg-gray-600 rounded-lg mb-2"></div>
                  <div className="h-3 w-24 bg-gray-600 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div
          className="rounded-lg sm:rounded-xl p-1"
          style={{
            background:
              "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
          }}
        >
          <div className="bg-[#5E2047] rounded-lg sm:rounded-xl">
            {/* Header */}

            <div className="p-6 border-b border-gray-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  <div className="h-6 w-32 bg-gray-600 rounded-md"></div>
                </div>
                <div className="h-4 w-40 bg-gray-600 rounded-md"></div>
              </div>
            </div>

            {/* Desktop View Skeleton (xl+) */}
            <div className="hidden xl:block p-6">
              <div className="overflow-hidden">
                <div className="bg-gray-900/30 rounded-xl border border-gray-600/20 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-600/30">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4">
                      <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                      <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                      <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                      <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
                      <div className="col-span-2 h-4 bg-gray-600 rounded-md"></div>
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
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 w-24 bg-gray-600 rounded-md mb-2"></div>
                            <div className="h-3 w-20 bg-gray-600 rounded-md"></div>
                          </div>
                        </div>

                        {/* Package Details */}
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
                        <div className="col-span-2 flex justify-center">
                          <div className="w-32 h-8 bg-gray-600 rounded-xl"></div>
                        </div>

                        {/* Game Info */}
                        <div className="col-span-2">
                          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                            <div className="flex justify-between mb-2">
                              <div className="h-3 w-8 bg-gray-600 rounded-md"></div>
                              <div className="h-3 w-8 bg-gray-600 rounded-md"></div>
                            </div>
                            <div className="h-2 w-full bg-gray-600 rounded-md"></div>
                          </div>
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

            {/* Large Tablet View Skeleton (lg to xl) */}
            <div className="hidden lg:block xl:hidden p-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-xl p-5 border border-gray-600/20"
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

            {/* Mobile Card View Skeleton */}
            <div className="lg:hidden p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/30 to-gray-900/20 rounded-xl p-5 border border-gray-600/20 shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gray-600 rounded-xl"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-600 rounded-md mb-2"></div>
                      <div className="h-4 w-24 bg-gray-600 rounded-md"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-600 rounded-xl"></div>
                  </div>

                  {/* Package Info Card */}
                  <div className="bg-gray-800/40 rounded-lg p-4 mb-4 border border-gray-600/20">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-16 bg-gray-600 rounded-md"></div>
                        <div className="h-4 w-24 bg-gray-600 rounded-md"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-600 rounded-md"></div>
                        <div className="h-4 w-28 bg-gray-600 rounded-md"></div>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-600/20">
                        <div className="h-4 w-20 bg-gray-600 rounded-md"></div>
                        <div className="h-5 w-16 bg-gray-600 rounded-md"></div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-3 border-t border-gray-600/20">
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
                        <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
                        <div className="h-6 w-24 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="h-12 w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="p-6 border-t border-gray-600/30 bg-gradient-to-r from-gray-800/20 to-gray-900/20">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <div className="h-4 w-48 bg-gray-600 rounded-md"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>
                  <div className="bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-600/20">
                    <div className="h-4 w-16 bg-gray-600 rounded-md"></div>
                  </div>
                  <div className="h-10 w-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl"></div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersTab = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { user } = useStore();

  const {
    data: ordersData,
    error: ordersError,
    refetch: refetchOrders,
    loading: loadingOrders,
  } = useCustomerOrders({
    customerId: user?.id,
    page,
    limit,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!ordersData?.orders)
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };

    const orders = ordersData.orders;
    return {
      total: orders.length,
      completed: orders.filter(
        (o: CustomerOrderListDto) => o.status === "COMPLETED"
      ).length,
      inProgress: orders.filter(
        (o: CustomerOrderListDto) => o.status === "IN_PROGRESS"
      ).length,
      pending: orders.filter(
        (o: CustomerOrderListDto) => o.status === "PENDING"
      ).length,
    };
  }, [ordersData]);

  if (loadingOrders) {
    return <ModernOrdersSkeleton />;
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1
              className={`${orbitron.className} text-2xl sm:text-3xl md:text-4xl font-bold text-white`}
            >
              My Orders
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg">
            Track and manage all your gaming service orders in one place
          </p>
        </div>


        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: ShoppingCart,
              color: "from-blue-500 to-cyan-400",
              trend: stats.total > 0 ? "+100%" : "0%",
              description: "All time orders",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-400",
              trend: stats.completed > 0 ? "Success" : "0%",
              description: "Successfully finished",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: Activity,
              color: "from-orange-500 to-amber-400",
              trend: stats.inProgress > 0 ? "Active" : "None",
              description: "Currently running",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "from-purple-500 to-pink-400",
              trend: stats.pending > 0 ? "Waiting" : "None",
              description: "Awaiting assignment",
            },
          ].map((stat, index) => (
            <div
              key={index}

              className="rounded-xl p-1 transition-all duration-300 hover:scale-105 cursor-pointer group"

              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >

              <div className="bg-[#5E2047] rounded-xl p-6 h-full relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          stat.trend.includes("+") ||
                          stat.trend === "Success" ||
                          stat.trend === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : stat.trend === "Waiting"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-xs">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div
          className="rounded-lg sm:rounded-xl p-1"
          style={{
            background:
              "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
          }}
        >
          <div className="bg-[#5E2047] rounded-lg sm:rounded-xl">
            {/* Header */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-gray-600/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                  <h2
                    className={`${orbitron.className} text-xl sm:text-2xl font-bold text-white`}
                  >
                    Recent Orders
                  </h2>
                </div>
                {ordersData?.total && (
                  <div className="text-xs sm:text-sm text-gray-300">
                    Showing {Math.min(page * limit, ordersData.total)} of{" "}
                    {ordersData.total} orders
                  </div>
                )}
              </div>
            </div>

            {!ordersData?.orders?.length ? (
              <div className="text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Inbox className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                </div>
                <h3
                  className={`${orbitron.className} text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3`}
                >
                  No Orders Yet
                </h3>
                <p className="text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  Ready to boost your gaming performance? Browse our services
                  and place your first order!
                </p>
                <Link
                  href="/dashboard/customer"
                  className="inline-flex items-center gap-2 font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 hover:opacity-90 transition-opacity duration-200 py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg text-sm sm:text-base"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Browse Services
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden xl:block p-6">
                  <div className="overflow-hidden">
                    {/* Modern Table Container */}
                    <div className="bg-gray-900/30 rounded-xl border border-gray-600/20 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-600/30">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-300 text-xs uppercase tracking-wider font-semibold">
                          <div className="col-span-2">Game & Service</div>
                          <div className="col-span-2">Package Details</div>
                          <div className="col-span-2 text-center">
                            Price & Provider
                          </div>
                          <div className="col-span-2 text-center">Status</div>
                          <div className="col-span-2 text-center">
                            Game Info
                          </div>
                          <div className="col-span-2 text-center">Action</div>
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
                              <div className="col-span-2 flex items-center gap-3 min-w-0">
                                <div className="relative">
                                  {order?.subpackage?.service?.game?.image ? (
                                    <SafeImage
                                      src={order.subpackage.service.game.image}
                                      alt={order.subpackage.service.game.name}
                                      placeholder="/images/placeholder.png"
                                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-600/30 group-hover:ring-pink-500/30 transition-all duration-200"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center ring-2 ring-gray-600/30">
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-white text-sm group-hover:text-pink-300 transition-colors truncate">
                                    {order.subpackage?.service?.game?.name}
                                  </h4>
                                  <p className="text-gray-400 text-xs truncate">
                                    {order.subpackage?.service?.name}
                                  </p>
                                </div>
                              </div>

                              {/* Package Details */}
                              <div className="col-span-2 min-w-0">
                                <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                                  <p className="text-gray-200 text-sm font-medium truncate">
                                    {order.subpackage?.name}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {order.subpackage?.duration || "Standard"}
                                  </p>
                                </div>
                              </div>

                              {/* Price & Provider */}
                              <div className="col-span-2 text-center">
                                <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                                  <p className="text-white font-bold text-lg">
                                    ${order.price.toFixed(2)}
                                  </p>
                                  <p className="text-gray-400 text-xs truncate mt-1">
                                    {(() => {
                                      const filtered =
                                        order?.providers?.filter((provider) =>
                                          [
                                            "APPROVED",
                                            "COMPLETED",
                                            "VERIFIED",
                                          ].includes(provider?.status)
                                        ) || [];
                                      const first = filtered[0];
                                      if (!first) return "No Provider";
                                      return `${first.username}${
                                        filtered.length > 1
                                          ? ` +${filtered.length - 1}`
                                          : ""
                                      }`;
                                    })()}
                                  </p>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="col-span-2 flex justify-center">
                                <div className="w-full max-w-[140px]">
                                  <span
                                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 border backdrop-blur-sm ${getStatusColor(
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

                              {/* Game Info */}
                              <div className="col-span-2">
                                <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-600/20">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="text-center">
                                      <p className="text-gray-400 mb-1">
                                        Games
                                      </p>
                                      <p className="text-white font-semibold">
                                        {order?.gamesCount != null &&
                                        order.gamesCount > 0
                                          ? order.gamesCount
                                          : "-"}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-gray-400 mb-1">Team</p>
                                      <p className="text-white font-semibold">
                                        {order?.requiredCount != null
                                          ? order.requiredCount
                                          : "-"}
                                      </p>
                                    </div>
                                  </div>
                                  {order?.rank?.name && (
                                    <div className="mt-2 pt-2 border-t border-gray-600/20">
                                      <p className="text-gray-400 text-xs mb-1">
                                        Rank
                                      </p>
                                      <p className="text-pink-300 text-xs font-medium truncate">
                                        {order.rank.name}
                                        {typeof order?.rank?.additionalCost ===
                                          "number" &&
                                        order.rank.additionalCost > 0
                                          ? ` +$${order.rank.additionalCost}`
                                          : ""}
                                      </p>
                                    </div>
                                  )}
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
                                  className="w-full max-w-[120px] px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-pink-500/25"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden 2xl:inline">
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

                {/* Large Tablet View (lg to xl) */}
                <div className="hidden lg:block xl:hidden p-6">
                  <div className="space-y-4">
                    {ordersData.orders.map((order: CustomerOrderListDto) => (
                      <div
                        key={order.id}
                        className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-xl p-5 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            {order?.subpackage?.service?.game?.image ? (
                              <SafeImage
                                src={order.subpackage.service.game.image}
                                alt={order.subpackage.service.game.name}
                                placeholder="/images/placeholder.png"
                                className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-600/30"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center ring-2 ring-gray-600/30">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-lg mb-1">
                              {order.subpackage?.service?.game?.name}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {order.subpackage?.service?.name} •{" "}
                              {order.subpackage?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-xl">
                              ${order.price.toFixed(2)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {(() => {
                                const filtered =
                                  order?.providers?.filter((provider) =>
                                    [
                                      "APPROVED",
                                      "COMPLETED",
                                      "VERIFIED",
                                    ].includes(provider?.status)
                                  ) || [];
                                const first = filtered[0];
                                if (!first) return "No Provider";
                                return `${first.username}${
                                  filtered.length > 1
                                    ? ` +${filtered.length - 1}`
                                    : ""
                                }`;
                              })()}
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
                              {order.status.replace("_", " ").toLowerCase()}
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
                    ))}
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {ordersData.orders.map((order: CustomerOrderListDto) => (
                    <div
                      key={order.id}

                      className="bg-gradient-to-br from-gray-800/30 to-gray-900/20 rounded-xl p-5 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-200 backdrop-blur-sm shadow-lg"
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                          {order?.subpackage?.service?.game?.image ? (
                            <SafeImage
                              src={order.subpackage.service.game.image}
                              alt={order.subpackage.service.game.name}
                              placeholder="/images/placeholder.png"
                              className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-600/30"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center ring-2 ring-gray-600/30">
                              <Package className="w-7 h-7 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {order.subpackage?.service?.game?.name}
                          </h3>
                          <p className="text-gray-300 text-sm">

                            {order.subpackage?.service?.name}
                          </p>
                        </div>
                        <span

                          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize hidden sm:inline">
                            {order.status.replace("_", " ").toLowerCase()}
                          </span>
                        </span>
                      </div>

                      {/* Package Info Card */}
                      <div className="bg-gray-800/40 rounded-lg p-4 mb-4 border border-gray-600/20">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">
                              Package:
                            </span>
                            <span
                              className="text-white font-semibold truncate ml-3"
                              title={order.subpackage?.name}
                            >
                              {order.subpackage?.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">
                              Provider:
                            </span>
                            <span className="text-white font-semibold">
                              {(() => {
                                const filtered =
                                  order?.providers?.filter((provider) =>
                                    [
                                      "APPROVED",
                                      "COMPLETED",
                                      "VERIFIED",
                                    ].includes(provider?.status)
                                  ) || [];
                                const first = filtered[0];
                                if (!first) return "No Provider";
                                return `${first.username}${
                                  filtered.length > 1
                                    ? ` +${filtered.length - 1}`
                                    : ""
                                }`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-600/20">
                            <span className="text-gray-400 font-medium">
                              Total Price:
                            </span>
                            <span className="text-white font-bold text-lg">
                              ${order.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {(order?.gamesCount ||
                          order?.requiredCount ||
                          order?.rank?.name) && (
                          <div className="mt-4 pt-3 border-t border-gray-600/20">
                            <div className="flex flex-wrap gap-2">
                              {order?.gamesCount != null &&
                                order.gamesCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    <ShoppingCart className="w-3 h-3" />
                                    <span>{order.gamesCount} Games</span>
                                  </span>
                                )}
                              {order?.requiredCount != null &&
                                order.requiredCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <Users className="w-3 h-3" />
                                    <span>{order.requiredCount} Team</span>
                                  </span>
                                )}
                              {order?.rank?.name && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>
                                    {order.rank.name}
                                    {typeof order?.rank?.additionalCost ===
                                      "number" && order.rank.additionalCost > 0
                                      ? ` +$${order.rank.additionalCost}`
                                      : ""}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        href={
                          order.status === "PENDING"
                            ? `/dashboard/customer/orders/${order.id}/pending`
                            : `/dashboard/customer/orders/${order.id}`
                        }
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      >
                        <Eye className="w-4 h-4" />
                        View Order Details
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Enhanced Pagination */}
                <div className="p-6 border-t border-gray-600/30 bg-gradient-to-r from-gray-800/20 to-gray-900/20">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-300 font-medium">
                      {ordersData?.total ? (
                        <span className="inline-flex items-center gap-2">
                          <Package className="w-4 h-4 text-pink-400" />
                          Showing {(page - 1) * limit + 1}-
                          {Math.min(page * limit, ordersData.total)} of{" "}
                          {ordersData.total} orders
                        </span>
                      ) : (
                        "No orders found"
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:hover:scale-100 hover:scale-105"

                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>


                      <div className="bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-600/20">
                        <span className="text-white font-bold">{page}</span>
                        <span className="text-gray-400 mx-2">of</span>
                        <span className="text-gray-300 font-medium">
                          {Math.ceil((ordersData?.total || 0) / limit) || 1}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            ordersData?.total &&
                            page * limit < ordersData.total
                          ) {
                            setPage((prev) => prev + 1);
                          }
                        }}
                        disabled={
                          !ordersData?.total || page * limit >= ordersData.total
                        }
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:hover:scale-100 hover:scale-105"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
