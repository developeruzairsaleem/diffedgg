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

// Enhanced skeleton component
const ModernOrdersSkeleton = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-700 rounded-lg"></div>
            <div className="h-6 sm:h-7 md:h-8 w-24 sm:w-28 md:w-32 bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-4 sm:h-5 w-64 sm:w-72 md:w-80 bg-gray-700 rounded-md"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg sm:rounded-xl p-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-600 rounded-lg"></div>
                  <div className="h-5 sm:h-6 w-10 sm:w-12 bg-gray-600 rounded-md"></div>
                </div>
                <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-600 rounded-md mb-2"></div>
                <div className="h-6 sm:h-7 md:h-8 w-12 sm:w-14 md:w-16 bg-gray-600 rounded-lg"></div>
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
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded"></div>
                <div className="h-5 sm:h-6 w-24 sm:w-28 md:w-32 bg-gray-600 rounded-md"></div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block p-4 md:p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600/30">
                    {[
                      "Game",
                      "Service",
                      "Package",
                      "Provider",
                      "Price",
                      "Status",
                      "Action",
                    ].map((header, index) => (
                      <th key={index} className="text-left py-3 md:py-4 px-2 md:px-4">
                        <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-600 rounded-md"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-600/20">
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-600 rounded-lg"></div>
                          <div className="h-3 md:h-4 w-20 md:w-24 bg-gray-600 rounded-md"></div>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-3 md:h-4 w-24 md:w-28 bg-gray-600 rounded-md"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-3 md:h-4 w-28 md:w-32 bg-gray-600 rounded-md"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-600 rounded-md"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-3 md:h-4 w-12 md:w-16 bg-gray-600 rounded-md"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-5 md:h-6 w-16 md:w-20 bg-gray-600 rounded-full"></div>
                      </td>
                      <td className="py-3 md:py-4 px-2 md:px-4">
                        <div className="h-7 md:h-8 w-20 md:w-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-600/30"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 sm:h-5 w-28 sm:w-32 bg-gray-600 rounded-md mb-1 sm:mb-2"></div>
                      <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-600 rounded-md"></div>
                    </div>
                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-600 rounded-full flex-shrink-0"></div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="flex justify-between items-center">
                      <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-600 rounded-md"></div>
                      <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-600 rounded-md"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-600 rounded-md"></div>
                      <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-600 rounded-md"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-600 rounded-md"></div>
                      <div className="h-3 sm:h-4 w-12 sm:w-16 bg-gray-600 rounded-md"></div>
                    </div>
                  </div>

                  <div className="h-9 sm:h-10 w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 sm:p-5 md:p-6 border-t border-gray-600/30">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="h-3 sm:h-4 w-24 sm:w-28 md:w-32 bg-gray-600 rounded-md"></div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 sm:h-9 md:h-10 w-20 sm:w-22 md:w-24 bg-gray-600 rounded-lg"></div>
                  <div className="h-5 sm:h-6 w-12 sm:w-14 md:w-16 bg-gray-600 rounded-md"></div>
                  <div className="h-8 sm:h-9 md:h-10 w-20 sm:w-22 md:w-24 bg-gray-600 rounded-lg"></div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: ShoppingCart,
              color: "from-blue-500 to-cyan-400",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-400",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: Activity,
              color: "from-orange-500 to-amber-400",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "from-purple-500 to-pink-400",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-lg sm:rounded-xl p-1"
              style={{
                background:
                  "linear-gradient(90deg, #EE2C81 0%, #FE0FD0 33%, #58B9E3 66%, #F79FC5 100%)",
              }}
            >
              <div className="bg-[#5E2047] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                </div>
                <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
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
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="p-4 md:p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-600/30">
                            <th className="text-left py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Game
                            </th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Package
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Price
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Status
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Games
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Teammates
                            </th>
                            <th className="text-left py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Rank
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              ELO
                            </th>
                            <th className="text-center py-3 md:py-4 px-3 md:px-4 text-gray-300 font-semibold text-sm md:text-base">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersData.orders.map(
                            (order: CustomerOrderListDto) => (
                              <tr
                                key={order.id}
                                className="border-b border-gray-600/20 hover:bg-white/5 transition-colors duration-200"
                              >
                                {/* Game */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    {order?.subpackage?.service?.game?.image ? (
                                      <SafeImage
                                        src={
                                          order.subpackage.service.game.image
                                        }
                                        alt={order.subpackage.service.game.name}
                                        placeholder="/images/placeholder.png"
                                        className="w-10 h-10 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                    <span className="text-white font-medium">
                                      {order.subpackage?.service?.game?.name}
                                    </span>
                                  </div>
                                </td>
                                {/* Package (service • package) */}
                                <td
                                  className="py-4 px-4 text-gray-300 max-w-[280px] truncate"
                                  title={`${order.subpackage?.service?.name} • ${order.subpackage?.name}`}
                                >
                                  {order.subpackage?.service?.name} •{" "}
                                  {order.subpackage?.name}
                                </td>
                                {/* Price + Provider */}
                                <td className="py-4 px-4 text-center">
                                  <div className="text-white font-semibold">
                                    ${order.price}
                                  </div>
                                  <div className="text-gray-400 text-xs truncate">
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
                                  </div>
                                </td>
                                {/* Status */}
                                <td className="py-4 px-4 text-center">
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-2 ${getStatusColor(
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
                                </td>
                                {/* Games */}
                                <td className="py-4 px-4 text-center">
                                  <span className="text-white">
                                    {order?.gamesCount != null &&
                                    order.gamesCount > 0
                                      ? order.gamesCount
                                      : "-"}
                                  </span>
                                </td>
                                {/* Teammates */}
                                <td className="py-4 px-4 text-center">
                                  <span className="text-white">
                                    {order?.requiredCount != null
                                      ? order.requiredCount
                                      : "-"}
                                  </span>
                                </td>
                                {/* Rank */}
                                <td className="py-4 px-4">
                                  <span className="text-white truncate block">
                                    {order?.rank?.name
                                      ? `${order.rank.name}${
                                          typeof order?.rank?.additionalCost ===
                                            "number" &&
                                          order.rank.additionalCost > 0
                                            ? ` +$${order.rank.additionalCost}`
                                            : ""
                                        }`
                                      : "-"}
                                  </span>
                                </td>
                                {/* ELO */}
                                <td className="py-4 px-4 text-center">
                                  <span className="text-white">
                                    {order?.subpackage?.dynamicPricing &&
                                    order?.subpackage?.minELO != null &&
                                    order?.subpackage?.maxELO != null
                                      ? `${order.subpackage.minELO}-${order.subpackage.maxELO}`
                                      : "-"}
                                  </span>
                                </td>
                                {/* Action */}
                                <td className="py-4 px-4 text-center">
                                  <Link
                                    href={
                                      order.status === "PENDING"
                                        ? `/dashboard/customer/orders/${order.id}/pending`
                                        : `/dashboard/customer/orders/${order.id}`
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </Link>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {ordersData.orders.map((order: CustomerOrderListDto) => (
                    <div
                      key={order.id}
                      className="bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-gray-600/30"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {order?.subpackage?.service?.game?.image ? (
                          <SafeImage
                            src={order.subpackage.service.game.image}
                            alt={order.subpackage.service.game.name}
                            placeholder="/images/placeholder.png"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                            {order.subpackage?.service?.game?.name}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">
                            {order.subpackage?.service?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 flex-shrink-0 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize hidden sm:inline">
                            {order.status.replace("_", " ").toLowerCase()}
                          </span>
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Package:</span>
                          <span
                            className="text-white font-medium truncate ml-2"
                            title={order.subpackage?.name}
                          >
                            {order.subpackage?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Provider:</span>
                          <span className="text-white">
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
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-green-400 font-bold">
                            ${order.price}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={
                          order.status === "PENDING"
                            ? `/dashboard/customer/orders/${order.id}/pending`
                            : `/dashboard/customer/orders/${order.id}`
                        }
                        className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-4 sm:p-5 md:p-6 border-t border-gray-600/30">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                      {ordersData?.total &&
                        `Showing ${(page - 1) * limit + 1}-${Math.min(
                          page * limit,
                          ordersData.total
                        )} of ${ordersData.total} orders`}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <span className="text-white font-medium px-2 sm:px-3 text-sm">
                        {page} of{" "}
                        {Math.ceil((ordersData?.total || 0) / limit) || 1}
                      </span>
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
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
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
