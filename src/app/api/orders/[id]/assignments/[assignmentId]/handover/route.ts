import { type NextRequest, NextResponse } from "next/server";
import type { ApiResponse, AssignmentUpdateRequest } from "@/types/order.dto";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/sessions";
import { prisma } from "@/lib/prisma";

// Inline function to get order by ID
async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          profileImage: true,
        },
      },
      subpackage: {
        include: {
          service: {
            include: {
              game: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      assignments: {
        include: {
          provider: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              profileImage: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  return order;
}

// Inline function to update assignment
async function updateAssignment(
  assignmentId: string,
  data: AssignmentUpdateRequest,
  order?: any,
  approvedCount?: number
): Promise<boolean> {
  console.log("Updating assignment:", assignmentId, data);
  try {
    if (!assignmentId) {
      throw new Error("Missing assignmentId");
    }

    // Coerce plain string status to valid uppercase enum string
    const updateData: any = { ...data };
    if (typeof updateData.status === "string") {
      const upper = updateData.status.toUpperCase();
      const valid = [
        "REPLACED",
        "PENDING",
        "APPROVED",
        "COMPLETED",
        "VERIFIED",
      ];
      if (!valid.includes(upper)) {
        throw new Error(`Invalid status value: ${updateData.status}`);
      }
      updateData.status = upper;
    }

    await prisma.orderAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    // Cross-checking logic: update order status if needed
    if (order && typeof approvedCount === 'number') {
      if (approvedCount - 1 < order.requiredCount) {
        console.log("Updating order status to IN_PROGRESS", approvedCount - 1, order.requiredCount);
        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: "IN_PROGRESS",
            isInQueue: true,
          },
        });
      }
    }

    return true;
  } catch (error) {
    const anyErr: any = error as any;
    console.error(
      "Error updating assignment:",
      anyErr?.code || anyErr?.name || "",
      anyErr?.meta || "",
      anyErr?.message || anyErr
    );
    return false;
  }
}

// Update the assignment status from customer point of view. only able to change to approved
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    // get and verify ther user session

    // Decrypt the session from the cookie
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
    // Fetch the order and its assignments
    const order = await getOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow if order.status is IN_PROGRESS
    if (order.status !== "IN_PROGRESS" && order.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Order is not in progress or active" },
        { status: 403 }
      );
    }

    // Check if user is a provider on this specific assignment
    const assignment = order.assignments.find((a: any) => a.id === params.assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    const isProvider = session?.userId === assignment.providerId;

    if (!isProvider) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Count assignments with status APPROVED, VERIFIED, or COMPLETED
    const approvedCount = order.assignments.filter((a: any) =>
      ["APPROVED", "VERIFIED", "COMPLETED"].includes(a.status)
    ).length;

    // if (approvedCount >= order.requiredCount) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error:
    //         "Required count already fulfilled. Cannot approve more assignments.",
    //     },
    //     { status: 400 }
    //   );
    // }

    const success = await updateAssignment(
      params.assignmentId,
      { status: "REPLACED" },
      order,
      approvedCount
    );
    if (!success) {
      const response: ApiResponse<never> = {
        success: false,
        error: "Failed to approve assignment",
      };
      console.log(
        "PUT ERROR response from /api/orders/[orderId]/assignments/[assignmentId]",
        response
      );
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse<never> = {
      success: true,
      message: "Assignment handed over successfully",
    };
    console.log(
      "PUT SUCCESS response from /api/orders/[orderId]/assignments/[assignmentId]",
      response
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating assignment:", error);
    console.log(
      "PUT error response from /api/orders/[orderId]/assignments/[assignmentId]",
      error
    );
    const response: ApiResponse<never> = {
      success: false,
      error: "Failed to update assignment",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
