"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  ServerCrash,
  Check,
  X,
  Star,
  RefreshCw,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  Crown,
  Target,
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

// --- CORE GAME/SERVICE/PACKAGE MODELS ---
export interface Game {
  id: string;
  name: string;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  game: Game;
}

export interface Subpackage {
  id: string;
  name: string;
  price: number;
  requiredProviders: number;
  dynamicPricing?: boolean;
  basePricePerELO?: number | null;
  minELO?: number | null;
  maxELO?: number | null;
  service: Service;
}

// --- PROVIDER & ASSIGNMENT MODELS ---
export interface Provider {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  completedOrders: number;
  joinedAt: string;
}

export type AssignmentStatus =
  | "PENDING"
  | "APPROVED"
  | "VERIFIED"
  | "COMPLETED"
  | "REPLACED";

export interface OrderAssignment {
  id: string;
  provider: Provider;
  status: AssignmentStatus;
  assignedAt: string;
}

// --- ORDER MODEL ---
export interface Order {
  id: string;
  orderNumber: string;
  notes: string;
  isInQueue: boolean;
  customerId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  requiredCount: number;
  rerollsLeft: number;
  subpackage: Subpackage;
  assignments: OrderAssignment[];
  updatedAt: string;
  gamesCount?: number | null;
  rank?: { name?: string; additionalCost?: number } | null;
}

// --- API RESPONSE TYPES ---
export interface OrderApiResponse {
  success: boolean;
  data?: Order;
  error?: string;
}

export interface AssignmentActionResponse {
  success: boolean;
  data?: {
    order: Order;
    message: string;
  };
  error?: string;
}

// --- HELPER & UI COMPONENTS ---
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const QueueStatusCard = ({
  approvedCount,
  requiredCount,
}: {
  approvedCount: number;
  requiredCount: number;
}) => {
  const percentage =
    requiredCount > 0 ? (approvedCount / requiredCount) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-pink-600 via-purple-400 to-cyan-400 rounded-lg p-1">
      <Card className="relative overflow-hidden border-0 bg-[#3A0F2A] backdrop-blur-sm">
        <div className="absolute inset-0" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Queue Status
            </h2>
            <p className="text-gray-400 mt-2">
              Finding the perfect team for your order
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Circular Progress */}
            <div className="relative w-24 h-24 ">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${percentage * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {approvedCount}/{requiredCount}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Providers Found</span>
                <span>{percentage.toFixed(0)}% Complete</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ApplicantCard = ({
  assignment,
  onAccept,
  onDecline,
  rerollsLeft,
  isProcessing,
}: {
  assignment: OrderAssignment;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  rerollsLeft: number;
  isProcessing: boolean;
}) => {
  const { provider } = assignment;

  return (
    <div className="bg-gradient-to-r p-1 rounded-lg from-pink-600 via-purple-400 to-cyan-400">
      <Card className="relative overflow-hidden border-0 p-1 rounded-lg  backdrop-blur-sm">
        <div className="absolute inset-0 bg-[#3A0F2A]" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="text-center mb-6">
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
              New Applicant
            </Badge>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Player Card
            </h3>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            {/* Provider Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="relative">
                <SafeImage
                  placeholder="/images/placeholder.png"
                  src={provider.avatar || "/images/placeholder.png"}
                  alt={provider.username}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border-2 border-gradient-to-r from-pink-500 to-purple-500"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>

              <div className="text-center sm:text-left space-y-2">
                <h4 className="text-xl sm:text-2xl font-bold text-white">
                  {provider.username}
                </h4>
                <div className="space-y-1 text-gray-300">
                  <p className="flex items-center gap-2 justify-center sm:justify-start">
                    <Check className="w-4 h-4 text-green-400" />
                    {provider.completedOrders} orders completed
                  </p>
                  <p className="flex items-center gap-2 justify-center sm:justify-start">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Member since {new Date(provider.joinedAt).getFullYear()}
                  </p>
                  <div className="flex justify-center sm:justify-start">
                    <StarRating rating={provider.rating} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[280px]">
              <Button
                onClick={() => onAccept(assignment.id)}
                disabled={isProcessing}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                Accept Provider
              </Button>
              <Button
                onClick={() => onDecline(assignment.id)}
                disabled={rerollsLeft <= 0 || isProcessing}
                variant="outline"
                className="w-full py-4 text-base border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 mr-2" />
                Decline ({rerollsLeft} rerolls left)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ApprovedProviderCard = ({
  assignment,
}: {
  assignment: OrderAssignment;
}) => {
  const { provider } = assignment;

  return (
    <Card className="border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/10 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={provider.avatar || "/placeholder.svg"}
              alt={provider.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">
              {provider.username}
            </h4>
            <p className="text-sm text-green-400 font-medium">
              Approved & Ready
            </p>
          </div>
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

const TeamCompleteCard = ({ onProceed }: { onProceed: () => void }) => {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-teal-900/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10" />
      <CardContent className="relative p-8 text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Team Complete!
            </h2>
            <p className="text-gray-300 text-lg">
              Your perfect team has been assembled and is ready to start working
              on your order.
            </p>
          </div>
          <Button
            onClick={onProceed}
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200"
          >
            Proceed to Order Tracking
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderNotesCard = ({ notes }: { notes: string }) => {
  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-2">Order Notes</h3>
            <p className="text-gray-300 leading-relaxed">{notes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- MAIN CUSTOMER PAGE ---
const CustomerPendingOrderPage = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [pendingApplicants, setPendingApplicants] = useState<OrderAssignment[]>(
    []
  );
  const [approvedProviders, setApprovedProviders] = useState<OrderAssignment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingAssignmentId, setProcessingAssignmentId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        // Only show the full-page skeleton on the very first load
        if (!order) {
          setIsLoading(true);
        }
      }
      setError(null);

      try {
        const response = await fetch(`/api/orders/${orderId}/pending`);
        const result: OrderApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }

        if (result.success && result.data) {
          setOrder(result.data);
          const approved = result.data.assignments.filter(
            (a) => a.status === "APPROVED"
          );
          const pending = result.data.assignments.filter(
            (a) => a.status === "PENDING"
          );
          setApprovedProviders(approved);
          setPendingApplicants(pending);
        } else {
          throw new Error(result.error || "Failed to fetch order data.");
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderId, order]
  );

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      fetchOrder(); // Don't show refresh loader for auto-refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

  const handleRefresh = () => {
    fetchOrder(true);
  };

  const handleAccept = useCallback(
    async (assignmentId: string) => {
      setProcessingAssignmentId(assignmentId);
      try {
        const response = await fetch(
          `/api/orders/${orderId}/assignments/${assignmentId}/approve`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result: AssignmentActionResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }

        if (result.success) {
          // Update the order state with the new data from the server
          fetchOrder(true);
        } else {
          throw new Error(result.error || "Failed to accept provider.");
        }
      } catch (err: any) {
        console.error("Error accepting provider:", err);
        setError(err.message);
      } finally {
        setProcessingAssignmentId(null);
      }
    },
    [orderId]
  );

  const handleDecline = useCallback(
    async (assignmentId: string) => {
      if (!order || order.rerollsLeft <= 0) return;

      setProcessingAssignmentId(assignmentId);
      try {
        const response = await fetch(
          `/api/orders/${orderId}/assignments/${assignmentId}/decline`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result: AssignmentActionResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }

        if (result.success) {
          // Update the order state with the new data from the server
          fetchOrder(true);
        } else {
          throw new Error(result.error || "Failed to decline provider.");
        }
      } catch (err: any) {
        console.error("Error declining provider:", err);
        setError(err.message);
      } finally {
        setProcessingAssignmentId(null);
      }
    },
    [orderId, order]
  );

  const handleProceedToTracking = () => {
    // Navigate to order tracking page
    window.location.href = `/dashboard/customer/orders/${orderId}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-6 w-40 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 w-36 bg-gray-700 rounded"></div>
        </div>

        {/* Order Notes */}
        <div className="h-28 bg-gray-800/60 rounded-lg"></div>

        {/* Queue Status */}
        <div className="h-60 bg-gray-800/60 rounded-lg"></div>

        {/* Pending Applicants (simulate 2 cards) */}
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-r p-1 rounded-lg from-pink-600 via-purple-400 to-cyan-400"
          >
            <div className="bg-[#3A0F2A] p-6 rounded-lg space-y-4">
              <div className="h-6 w-32 bg-gray-700 rounded mx-auto"></div>
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                  <div className="w-24 h-24 bg-gray-700 rounded-xl"></div>
                  <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-5 w-32 bg-gray-700 rounded"></div>
                    <div className="h-4 w-28 bg-gray-700 rounded"></div>
                    <div className="h-4 w-36 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[280px]">
                  <div className="h-12 bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Approved Team Section */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-800/60 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-gradient-to-br from-red-900/20 to-pink-900/10">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">Error</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <Button
            onClick={() => fetchOrder()}
            variant="outline"
            className="border-red-500/50"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="border-gray-500/30 bg-gradient-to-br from-gray-900/50 to-slate-900/30">
        <CardContent className="p-8 text-center">
          <ServerCrash className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-2xl font-semibold text-white">Order Not Found</h3>
        </CardContent>
      </Card>
    );
  }

  const isTeamFull = approvedProviders.length >= order.requiredCount;

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-400">
            {order.subpackage.service.game.name} - {order.subpackage.name}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-purple-500/50 bg-purple-900/20 hover:bg-purple-800/30"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Assignments
        </Button>
      </div>

      {/* Order Notes */}
      {order.notes && order.notes.trim() && (
        <OrderNotesCard notes={order.notes} />
      )}

      {isTeamFull ? (
        <TeamCompleteCard onProceed={handleProceedToTracking} />
      ) : (
        <>
          <QueueStatusCard
            approvedCount={approvedProviders.length}
            requiredCount={order.requiredCount}
          />

          {/* Extra Order Details (Games, Teammates, Rank, ELO) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/50">
              <p className="text-xs text-gray-300 mb-1">Games</p>
              <p className="text-white font-semibold text-lg">
                {order?.gamesCount != null && order.gamesCount > 0
                  ? order.gamesCount
                  : "-"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/50">
              <p className="text-xs text-gray-300 mb-1">Teammates</p>
              <p className="text-white font-semibold text-lg">
                {order?.requiredCount != null ? order.requiredCount : "-"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/50">
              <p className="text-xs text-gray-300 mb-1 flex items-center gap-1">
                <Crown className="w-4 h-4 text-purple-300" /> Rank
              </p>
              <p className="text-white font-semibold text-lg truncate">
                {order?.rank?.name
                  ? `${order.rank.name}${
                      typeof order?.rank?.additionalCost === "number" &&
                      order.rank.additionalCost > 0
                        ? ` +$${order.rank.additionalCost}`
                        : ""
                    }`
                  : "-"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/50">
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

          {/* Pending Applicants */}
          <div className="space-y-6">
            {pendingApplicants.map((assignment) => (
              <ApplicantCard
                key={assignment.id}
                assignment={assignment}
                onAccept={handleAccept}
                onDecline={handleDecline}
                rerollsLeft={order.rerollsLeft}
                isProcessing={Boolean(processingAssignmentId)}
              />
            ))}
          </div>
        </>
      )}

      {/* Approved Team Section */}
      {approvedProviders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Your Team ({approvedProviders.length}/{order.requiredCount})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {approvedProviders.map((assignment) => (
              <ApprovedProviderCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Waiting Message */}
      {pendingApplicants.length === 0 && !isTeamFull && (
        <Card className="border-gray-600/30 bg-gradient-to-br from-gray-900/30 to-slate-900/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Searching for Providers
            </h3>
            <p className="text-gray-400 mb-1">
              Your order is live in the queue and visible to all providers.
            </p>
            <p className="text-gray-500 text-sm">
              New applications will appear here automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// --- ROOT APP ---
export default function PendingPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen ">
      <div className="absolute inset-0 " />
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CustomerPendingOrderPage orderId={params.id} />
      </main>
    </div>
  );
}
