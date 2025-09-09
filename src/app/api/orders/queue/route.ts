import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/order.dto";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";

/**
 * @swagger
 * /api/orders/queue:
 *   get:
 *     summary: Retrieve a list of orders available for providers to apply to.
 *     description: Fetches orders from the database that are in a 'QUEUED' or 'MATCHING' state. This endpoint is intended for providers looking for new orders.
 *     tags: [Orders, Queue]
 *     responses:
 *       200:
 *         description: A list of available orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error.
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper authentication and authorization to ensure only providers can access this.

    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        {
          status: 401,
        }
      );
    }

    const availableOrders = await prisma.order.findMany({
      where: {
        isInQueue: true,
      },
      orderBy: {
        updatedAt: "desc", // First-in, first-out
      },
      include: {
        // Include any relevant data providers need to see before applying
        customer: true,
        subpackage: {
          include: {
            service: {
              include: {
                game: true,
              },
            },
          },
        },
        assignments: true,
      },
    });
    const updatedOrders = availableOrders
      .map((order) => {
        const approvedCount = order.assignments.reduce((acc, assignee) => {
          if (["APPROVED", "VERIFIED", "COMPLETED"].includes(assignee.status)) {
            return acc + 1;
          } else {
            return acc;
          }
        }, 0);

        order.approvedCount = approvedCount;

        return order;
      })
      .filter((order) => {
        const providerFound = order.assignments.find((assignment) => {
          return assignment.providerId === session?.userId;
        });
        return !providerFound;
      })
      .filter((order) => {
        return !(order.approvedCount >= order.requiredCount);
      });

    return NextResponse.json({
      success: true,
      data: updatedOrders,
    });
  } catch (error) {
    console.error("Error fetching order queue:", error);
    return NextResponse.json({
      success: false,
      error: "something went wrong fetching the queue orders",
    });
  }
}

/**
 * @swagger
 * /api/orders/queue:
 *   post:
 *     summary: Add a new order to the queue.
 *     description: This endpoint should be called after a customer successfully checks out. It sets the order status to 'QUEUED' and notifies all connected providers via Socket.IO that a new order is available.
 *     tags: [Orders, Queue]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the newly created order.
 *     responses:
 *       200:
 *         description: Order successfully added to the queue.
 *       400:
 *         description: Bad request, orderId is missing.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error.
 */
export async function PUT(request: NextRequest) {
  try {
    const { orderId, type } = await request.json();

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Something went wrong creating order",
      });
    }

    // TODO: Implement authentication to ensure this is a legitimate request post-checkout.

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        isInQueue: type === "ADD" ? true : false,
      },
    });

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error: "Cannot update the order with queue status",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error adding order to queue:", error);
    return NextResponse.json(
      { error: "error occured during updating the order", success: false },
      {
        status: 500,
      }
    );
  }
}
