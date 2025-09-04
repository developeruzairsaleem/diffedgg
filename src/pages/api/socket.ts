import type { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import type { NextApiResponseServerIO } from "../../lib/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new ServerIO(res.socket.server as any, {
      path: "/api/socket/",
      addTrailingSlash: true,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join-order", (orderId: string) => {
        socket.join(`order-${orderId}`);
        console.log(`User ${socket.id} joined order-${orderId}`);
      });

      socket.on("leave-order", (orderId: string) => {
        socket.leave(`order-${orderId}`);
        console.log(`User ${socket.id} left order-${orderId}`);
      });

      socket.on("send-message", (data: any) => {
        io.to(`order-${data.orderId}`).emit("new-message", data);
      });

      socket.on("typing", (data: any) => {
        socket.to(`order-${data.orderId}`).emit("user-typing", data);
      });

      // --- NEW: ORDER QUEUE & MATCHING EVENTS ---

      // Provider joins the main queue to listen for new orders
      socket.on("join-queue", () => {
        socket.join("provider-queue");
        console.log(`User ${socket.id} joined the provider queue`);
      });

      // Provider applies for an order
      // Data: { orderId: string, assignment: object }
      socket.on("provider-apply", (data) => {
        // Notify the specific customer in their order room
        io.to(`order-${data.orderId}`).emit("new-applicant", data.assignment);
        console.log(
          `Provider ${data.assignment.provider.username} applied for order ${data.orderId}`
        );
      });

      // Customer accepts a provider
      // Data: { orderId: string, providerId: string }
      socket.on("customer-accept-provider", (data) => {
        // This should ideally find the provider's socket ID to notify them directly
        // For now, we broadcast to the order room, client can filter
        io.to(`order-${data.orderId}`).emit("provider-accepted", {
          providerId: data.providerId,
        });
        console.log(
          `Customer accepted provider ${data.providerId} for order ${data.orderId}`
        );
      });

      // Customer cancels an order
      // Data: { orderId: string, providerIds: string[] }
      socket.on(
        "customer-cancel-order",
        (data: { orderId: string; providerIds: string[] }) => {
          // Broadcast globally; clients will filter by their own user id
          io.emit("order-cancelled", {
            orderId: data.orderId,
            providerIds: Array.isArray(data.providerIds)
              ? data.providerIds
              : [],
          });
          console.log(
            `Order ${
              data.orderId
            } cancelled by customer; notifying providers: ${
              (data.providerIds || []).length
            }`
          );
        }
      );

      // Customer rerolls a provider slot
      // Data: { orderId: string, providerId: string }
      socket.on("customer-reroll-provider", (data) => {
        io.to(`order-${data.orderId}`).emit("provider-rerolled", {
          providerId: data.providerId,
        });
        console.log(
          `Customer rerolled provider ${data.providerId} for order ${data.orderId}`
        );
      });

      // A provider leaves an active order, opening a slot
      // Data: { orderId: string, providerId: string }
      socket.on("provider-leave-active-order", (data) => {
        io.to(`order-${data.orderId}`).emit("active-provider-left", {
          providerId: data.providerId,
        });
        // Notify providers in the queue that a spot has opened up
        io.to("provider-queue").emit("replacement-needed", {
          orderId: data.orderId,
        });
        console.log(
          `Provider ${data.providerId} left active order ${data.orderId}`
        );
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }
  res.end();
}
