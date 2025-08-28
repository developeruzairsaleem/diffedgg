"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Gamepad2,
  DollarSign,
  Calendar,
  Target,
  Crown,
} from "lucide-react";
import Link from "next/link";
import ChatInterface from "@/components/chat/ChatInterface";
import type { OrderDetailDto } from "@/types/order.dto";
import { useStore } from "@/store/useStore";
import { Button, message, Modal } from "antd";
import OverlayLoader from "@/components/ui/OverlayLoader";

// Zod schema for cancellation form
const cancellationSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").min(10, "Please provide a detailed reason (at least 10 characters)"),
});

type CancellationFormData = z.infer<typeof cancellationSchema>;

// -------------------------------
// order detail page for customer
// ------------------------------------
export default function OrderDetailPage() {
  // ---------------------------------------------
  // application state for orderdetail page and chat page
  // --------------------------------------------

  const store = useStore();
  const params = useParams();
  const orderId = params!.id as string;
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Form management for cancellation reason
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationSchema),
    mode: "onChange",
    defaultValues: {
      reason: "",
    },
  });

  // Watch the reason field to enable/disable the confirm button
  const reasonValue = watch("reason");

  // Add wallet refetch function
  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/wallet/");
      const walletData = await response.json();
      if (walletData && !walletData.error) {
        store.setWallet(walletData);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  const handleApproveAssignment = async (assingmentId: string) => {
    setApprovingId(assingmentId);
    try {
      //  -------------------------------------------------
      // update the order assignment status to approved.
      // ---------------------------------------------------
      const response = await fetch(
        `/api/orders/${orderId}/assignments/${assingmentId}/approve`,
        {
          method: "PUT",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      // ------------------------------------------------------
      // check if the update of assignment was successful or not
      // ------------------------------------------------------
      if (!result.success) {
        setApprovingId(null);
        return message.error("Failed to approve the assignment");
      }
      message.success("Successfully Approved!");
      // Refetch order to update UI
      await fetchOrder();
      // Also refetch wallet to ensure balance is up-to-date
      await fetchWallet();
    } catch (error) {
      console.error("something went wrong", error);
      message.error("Something went wrong updating.");
    } finally {
      setApprovingId(null);
    }
  };

  //----------------------------------
  // Fetching order detail data
  // -------------------------------
  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  //-------------------------------------------
  //  fetch order on orderId change or first page load
  //--------------------------------------------
  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchWallet(); // Also fetch wallet data to ensure it's up-to-date
    }
  }, [orderId]);

  // Add effect to refresh wallet when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      // Refresh wallet data when user returns to the page
      fetchWallet();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // --------------------------------------------------
  // status color depending on the current order status
  // -------------------------------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  // ----------------------------------------------------
  // Get icon depending on the status of individual order
  // ----------------------------------------------------
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  // ------------------------------------------------------
  // If the order detail is loading show a loader by default
  // ------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen container mx-auto p-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-5 w-5 bg-gray-700 rounded"></div>
          <div className="h-5 w-32 bg-gray-700 rounded"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>

        {/* Order Status Card skeleton */}
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-gray-800/50">
            <div className="flex justify-between mb-4">
              <div className="h-5 w-32 bg-gray-700 rounded"></div>
              <div className="h-5 w-20 bg-gray-700 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="h-8 w-8 mx-auto mb-2 bg-gray-600 rounded-full"></div>
                  <div className="h-5 w-16 mx-auto bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-20 mx-auto bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Details Card skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-600 rounded"></div>
                <div className="h-3 w-24 bg-gray-600 rounded"></div>
                <div className="h-3 w-20 bg-gray-600 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-600 rounded"></div>
              <div className="h-3 w-full bg-gray-600 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-600 rounded"></div>
            </div>
          </div>

          {/* Provider Assignments skeleton */}
          <div className="p-6 rounded-lg bg-gray-800/50 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-gray-600 rounded"></div>
                    <div className="h-3 w-36 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-28 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no order exist return the message that no order found
  if (!order) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-white/80">
            The order you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Calculate the number of assignments with status APPROVED, VERIFIED, or COMPLETED
  const approvedAssignmentsCount = order.assignments.filter((a) =>
    ["APPROVED", "VERIFIED", "COMPLETED"].includes(a.status)
  ).length;

  // Access control: only allow if order.status is IN_PROGRESS and user is owner or approved/verified/completed provider
  const userId = store?.user?.id;
  const isCustomer = userId && userId === order.customerId;
  const isProvider =
    userId &&
    order.assignments.some(
      (a) =>
        a.providerId === userId &&
        ["APPROVED", "VERIFIED", "COMPLETED"].includes(a.status)
    );
  // can access the page if is pending or is in progress
  const canAccess =
    (order.status === "IN_PROGRESS" || order.status === "PENDING") &&
    (isCustomer || isProvider);

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/80">
            You do not have permission to view this order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <style jsx global>{`
        .game-title {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: bold;
        }
        .order-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: none;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/customer/orders">
            <div className="flex items-center gap-2 text-white hover:text-white/80 transition-colors cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Orders</span>
            </div>
          </Link>
          <Separator orientation="vertical" className="h-6 bg-white" />
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl text-gradient-to-r from-pink-500 to-cyan-500 p-2 font-bold text-white">
              Order #{order.orderNumber.slice(-8)}
            </h1>
            {order.status !== "CANCELLED" && (
              <Button
                onClick={() => setCancelModalOpen(true)}
                className="font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg py-2 px-4 rounded-lg inline-flex items-center justify-center whitespace-nowrap text-xs"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid p-2 w-full grid-cols-2 ">
              <TabsTrigger
                value="details"
                className="flex p-3 items-center gap-2 cursor-pointer text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500  data-[state=active]:via-purple-500 data-[state=active]:to-cyan-400
            transition-all"
              >
                <Gamepad2 className="h-4 w-4" />
                Order Details
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="flex p-3 cursor-pointer items-center gap-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500  data-[state=active]:via-purple-500 data-[state=active]:to-cyan-400
            transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {order.status === "CANCELLED" ? (
                <Card className="order-card">
                  <CardContent className="p-10 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Order Cancelled
                    </h2>
                    <p className="text-gray-300 mb-6">
                      This order has been cancelled. No further actions are
                      available.
                    </p>
                    <Button
                      onClick={() => window.history.back()}
                      className="font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 py-2 px-6 rounded-lg"
                    >
                      Go Back
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Order Status Card */}
                  <Card className="order-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-300" />
                          Order Status
                        </span>
                        <Badge
                          className={`text-white ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50/25 rounded-lg">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-300" />
                          <p className="text-2xl font-bold text-green-300">
                            ${order.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-white">Total Price</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50/30 rounded-lg">
                          <User className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                          <p className="text-2xl font-bold text-blue-300">
                            {order.approvedCount}/{order.requiredCount}
                          </p>
                          <p className="text-sm text-white">Providers</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50/30 rounded-lg">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-300" />
                          <p className="text-2xl font-bold text-purple-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-white">Created</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Service Details Card */}
                  <Card className="order-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5 text-purple-600" />
                        Service Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-gray-200">
                          <AvatarImage
                            src={
                              order.subpackage.service.game.image ||
                              "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            <Gamepad2 className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {order.subpackage.service.game.name}
                          </h3>
                          <p className="text-white">
                            {order.subpackage.service.name}
                          </p>
                          <p className="text-sm text-white">
                            {order.subpackage.name}
                          </p>
                        </div>
                      </div>

                      {order.subpackage.description && (
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-white text-sm">
                            {order.subpackage.description}
                          </p>
                        </div>
                      )}

                      {order.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-white text-sm whitespace-pre-wrap">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Extra Order Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-lg bg-gray-50/20">
                          <p className="text-xs text-gray-300 mb-1">Games</p>
                          <p className="text-white font-semibold text-lg">
                            {order?.gamesCount != null && order.gamesCount > 0
                              ? order.gamesCount
                              : "-"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50/20">
                          <p className="text-xs text-gray-300 mb-1">
                            Teammates
                          </p>
                          <p className="text-white font-semibold text-lg">
                            {order?.requiredCount != null
                              ? order.requiredCount
                              : "-"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50/20">
                          <p className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                            <Crown className="w-4 h-4 text-purple-300" /> Rank
                          </p>
                          <p className="text-white font-semibold text-lg truncate">
                            {order?.rank?.name
                              ? `${order.rank.name}${
                                  typeof order?.rank?.additionalCost ===
                                    "number" && order.rank.additionalCost > 0
                                    ? ` +$${order.rank.additionalCost}`
                                    : ""
                                }`
                              : "-"}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50/20">
                          <p className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                            <Target className="w-4 h-4 text-cyan-300" /> ELO
                          </p>
                          <p className="text-white font-semibold text-lg">
                            {order?.subpackage?.dynamicPricing &&
                            order?.subpackage?.minELO != null &&
                            order?.subpackage?.maxELO != null
                              ? `${order.subpackage.minELO}-${order.subpackage.maxELO}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Provider Assignments */}
                  {order.assignments.length > 0 && (
                    <Card className="order-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-purple-600" />
                          Provider Assignments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {order.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-4 bg-gray-50/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage
                                    src={
                                      assignment.provider.profileImage ||
                                      "/placeholder.svg"
                                    }
                                  />
                                  <AvatarFallback>
                                    <span className="p-3 rounded-full bg-gray-50/50">
                                      {assignment.provider.username[0].toUpperCase()}
                                    </span>
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {assignment.provider.username}{" "}
                                    <Badge
                                      className={`mb-2 ${
                                        assignment.status === "APPROVED"
                                          ? "bg-green-500"
                                          : assignment.status === "COMPLETED"
                                          ? "bg-blue-500"
                                          : assignment.status === "VERIFIED"
                                          ? "bg-purple-500"
                                          : assignment.status === "PENDING"
                                          ? "bg-yellow-500"
                                          : assignment.status === "REPLACED"
                                          ? "bg-red-500"
                                          : "bg-gray-500"
                                      } text-white`}
                                    >
                                      {assignment.status}
                                    </Badge>
                                  </p>
                                  {assignment?.provider?.bio ? (
                                    <p className="text-sm text-gray-300 max-w-md truncate">
                                      {assignment.provider.bio}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-gray-300 max-w-md truncate">
                                      No bio available
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex gap-2">
                                {
                                  // Only show approve button if status is PENDING and approvedAssignmentsCount < requiredCount
                                  assignment.status === "PENDING" &&
                                  approvedAssignmentsCount <
                                    order.requiredCount ? (
                                    <button
                                      onClick={() =>
                                        handleApproveAssignment(assignment.id)
                                      }
                                      disabled={approvingId === assignment.id}
                                      className={` rounded-lg bg-gradient-to-r text-white text-semibold from-pink-500 p-3 mr-4 via-purple-500 to-cyan-400 transition-all flex items-center justify-center ${
                                        approvingId === assignment.id
                                          ? "opacity-60 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {approvingId === assignment.id ? (
                                        <span className="flex items-center gap-2">
                                          <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                          >
                                            <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                            ></circle>
                                            <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                          </svg>
                                          Approving...
                                        </span>
                                      ) : (
                                        "Approve Provider"
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      disabled={true}
                                      className=" block rounded-lg text-white text-semibold  p-3 mr-4  bg-gray-50/30 transition-all"
                                    >
                                      {assignment.status}
                                    </button>
                                  )
                                }

                                {(assignment.status === "COMPLETED" ||
                                  assignment.status === "VERIFIED") &&
                                  (!assignment?.reviewText ? (
                                    <Link
                                      href={`/dashboard/customer/orders/${order.id}/assignments/${assignment.id}/review`}
                                      className="font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg py-2 px-4 rounded-lg inline-flex items-center justify-center whitespace-nowrap text-xs pointer-cursor"
                                    >
                                      Review
                                    </Link>
                                  ) : (
                                    <p className="font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg py-2 px-4 rounded-lg inline-flex items-center justify-center whitespace-nowrap text-xs pointer-cursor">
                                      Reviewed
                                    </p>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="chat">
              {store?.user && (
                <ChatInterface
                  orderId={order.id}
                  orderNumber={order.orderNumber}
                  currentUser={store?.user}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          reset(); // Reset form when modal is closed
        }}
        footer={null}
        centered
        styles={{ content: { background: "#5E2047" } }}
      >
        <div className="text-center p-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Cancel this order?
          </h3>
          <p className="text-gray-300 mb-4">This action cannot be undone.</p>

          {/* Cancellation Reason Textarea */}
          <div className="mb-4 text-left">
            <label className="block text-white text-sm font-medium mb-2">
              Reason for cancellation *
            </label>
            <Textarea
              {...register("reason")}
              placeholder="Please provide a detailed reason for cancelling this order..."
              className="w-full bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-1 focus:border-white/50 focus:ring-white"
              rows={4}
            />
            {errors.reason && (
              <p className="text-red-400 text-sm mt-1">{errors.reason.message}</p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setCancelModalOpen(false);
                reset(); // Reset form when keeping the order
              }}
              className="px-5 py-2 border border-gray-600 bg-transparent text-white hover:bg-gray-800/40"
            >
              Keep Order
            </Button>
            <Button
              loading={isCancelling}
              disabled={!isValid || isCancelling}
              onClick={handleSubmit(async (data) => {
                try {
                  setIsCancelling(true);
                  const res = await fetch(`/api/orders/${orderId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: "CANCELLED",
                      cancelReason: data.reason
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    message.error(json.error || "Failed to cancel order");
                  } else {
                    message.success("Order cancelled");
                    await fetchOrder();
                    setCancelModalOpen(false);
                    reset(); // Reset form after successful cancellation
                  }
                } catch (e) {
                  message.error("Something went wrong cancelling the order");
                } finally {
                  setIsCancelling(false);
                }
              })}
              className={`px-5 py-2 text-white transition-all ${
                isValid && !isCancelling
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
