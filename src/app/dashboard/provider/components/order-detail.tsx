"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { SetupSkeleton } from "@/components/ui/SetupSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Gamepad2,
  Info,
  CheckCircle,
  Upload,
  Store,
  Router,
  Flame,
} from "lucide-react";
import { orbitron } from "@/fonts/fonts";
import { Label } from "@/components/ui/label";
import ChatInterface from "@/components/chat/ChatInterface";
import { useStore } from "@/store/useStore";
import { UploadButton } from "@/utils/uploadthing";
import { Toaster } from "@/components/ui/sonner";

// --- UI SUB-COMPONENTS (Unchanged) ---

const CustomerInfoCard = ({ customer }: { customer: any }) => {
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  return (
    <Card
      style={{ backgroundColor: "#3A0F2A" }}
      className="bg-opacity-30 backdrop-blur-sm border-white/10"
    >
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <User className="w-5 h-5 mr-3" />
          Client Details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="w-12 h-12 border-2 border-cyan-400/50">
          <AvatarImage src={customer.profileImage || ""} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 font-bold">
            {getInitials(customer.username)}
          </AvatarFallback>
        </Avatar>
        <p className="text-lg font-semibold text-white">{customer.username}</p>
      </CardContent>
    </Card>
  );
};

const OrderDetailsCard = ({ order }: { order: any }) => (
  <Card
    style={{ backgroundColor: "#3A0F2A" }}
    className="bg-opacity-30 backdrop-blur-sm border-white/10"
  >
    <CardHeader>
      <CardTitle className="flex items-center text-white">
        <Info className="w-5 h-5 mr-3" />
        Order Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <p className="text-white/70">
        <strong>Service:</strong> {order.subpackage.name}
      </p>
      <p className="text-white/70">
        <strong>Game:</strong> {order.subpackage.service.game.name}
      </p>
      <p className="text-white/70">
        <strong>Order Price:</strong>{" "}
        <span className="font-bold text-green-400">
          ${order.price.toFixed(2)}
        </span>
      </p>
      {order?.currentELO != null && order?.targetELO != null && order?.currentELO != 0 && order?.targetELO != 0 && (
        <p className="text-white/70">
          <strong>ELO:</strong>{" "}
          <span className="font-bold text-orange-300 inline-flex items-center gap-1">
            <Flame className="w-4 h-4" />
            {order.currentELO} → {order.targetELO}
          </span>
        </p>
      )}
      <p className="text-white/70">
        <strong>Order Status:</strong>{" "}
        <span className="font-bold text-green-400">{order.status}</span>
      </p>
    </CardContent>
  </Card>
);

const ActionsCard = ({
  assignmentId,
  orderId,
  isCompleted,
  refetchAssignment,
}: {
  assignmentId: string;
  orderId: string;
  isCompleted: boolean;
  refetchAssignment: () => void;
}) => {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [isHandingOver, setIsHandingOver] = useState(false);

  const handleConfirmHandover = async () => {
    setIsHandingOver(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/assignments/${assignmentId}/handover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to handover assignment');
      }

      toast.success('Assignment handed over successfully');
      setShowHandoverModal(false);
      // Redirect to the provider dashboard/orders page after successful handover
      window.location.href = "/dashboard/provider";
    } catch (error: any) {
      console.error('Error handing over assignment:', error);
      toast.error('Failed to handover assignment', {
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setIsHandingOver(false);
    }
  };
  if (isCompleted) {
    return (
      <Card
        style={{ backgroundColor: "#3A0F2A" }}
        className="bg-opacity-30 backdrop-blur-sm border-white/10"
      >
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
            Order Assignment Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-400 text-center">
            This order is marked as complete and is under review.
          </p>

          
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      style={{ backgroundColor: "#3A0F2A" }}
      className="bg-opacity-30 backdrop-blur-sm border-white/10"
    >
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Gamepad2 className="w-5 h-5 mr-3" />
          Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 pt-2 items-center ">
          <p className="font-semibold text-white text-lg">
            Attach Completion Proof
          </p>
          <UploadButton
            className="bg-green-500 hover:scale-105 transition-all p-2 rounded-xl"
            endpoint="imageUploader"
            input={{ assignmentId }}
            onClientUploadComplete={(res) => {
              toast.success("Upload Complete!", {
                description: "Your proof has been submitted for verification.",
              });
              refetchAssignment(); // Refetch data to update status
            }}
            onUploadError={(error: Error) => {
              toast.error("Upload Failed!", {
                description: error.message || "Something went wrong.",
              });
            }}
          />
        </div>
        <Button
          onClick={() => setShowHandoverModal(true)}
          variant="destructive"
          className="w-full border border-white/50 rounded-lg mt-8"
        >
          HAND OVER
        </Button>

        {/* Handover Confirmation Modal */}
        <Dialog open={showHandoverModal} onOpenChange={setShowHandoverModal}>
          <DialogContent className="sm:max-w-[425px] bg-black/30 backdrop-blur-sm border-white/10">
            <DialogHeader>
              <DialogTitle>Confirm Handover</DialogTitle>
              <DialogDescription>
                Are you sure you want to hand over this assignment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowHandoverModal(false)}
                disabled={isHandingOver}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmHandover}
                disabled={isHandingOver}
              >
                {isHandingOver ? "Handing over..." : "Confirm Handover"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// --- THE MAIN PAGE COMPONENT ---

export default function ProviderSetupPage() {
  // Back button handler
  const handleBack = () => {
    window.location.href = "/dashboard/provider";
  };
  const params = useParams();
  const assignmentId = params!.id as string;
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const store = useStore();

  const isCompleted =
    assignment?.status === "COMPLETED" || assignment?.status === "VERIFIED";

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/provider-assignment/${assignmentId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAssignment(data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to load assignment", {
        description: error.message || "Could not load assignment details.",
      });
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  if (loading) {
    return <SetupSkeleton />;
  }

  if (!assignment) {
    return (
      <div className="text-center text-white/70 p-10">
        Assignment not found or access denied.
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: "#3A0F2A",
            borderColor: "#8A2BE2",
          },
        }}
      />
      {/* Back Button */}
      <div className="absolute top-3 left-3 p-4">
        <button
          onClick={handleBack}
          className="bg-black/70 text-white mb-4 px-4 py-2 hover:bg-black/50  rounded-lg shadow transition-all"
        >
        Back to Dashboard
        </button>
      </div>
      <div className="p-4 md:p-6 space-y-8">
        <div
          className="h-32 md:h-48 bg-cover bg-center rounded-lg flex items-end p-6"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url(${assignment.order.subpackage.service.game.image})`,
          }}
        >
          <h1
            className={`text-3xl md:text-4xl font-bold text-white ${orbitron.className}`}
          >
            {assignment.order.subpackage.service.game.name} Coaching Session
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <CustomerInfoCard customer={assignment.order.customer} />
            <OrderDetailsCard order={assignment.order} />
            <ActionsCard
              isCompleted={isCompleted}
              assignmentId={assignmentId}
              orderId={assignment.order.id}
              refetchAssignment={fetchAssignment}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {store.user && (
              <ChatInterface
                orderId={assignment.order.id}
                orderNumber={assignment.order.orderNumber}
                currentUser={store.user}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
