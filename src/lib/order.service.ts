import { prisma } from "@/lib/prisma";
import type {
  OrdersListRequest,
  OrdersListResponse,
  OrderListDto,
  OrderDetailDto,
  OrderUpdateRequest,
  AssignmentUpdateRequest,
  CustomerOrderListDto,
  CustomerOrderListResponse,
} from "@/types/order.dto";

export class OrderService {
  static async getOrders(
    params: OrdersListRequest
  ): Promise<OrdersListResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      gameId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(gameId && { subpackage: { service: { gameId } } }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" as const } },
          {
            customer: {
              username: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            customer: {
              email: { contains: search, mode: "insensitive" as const },
            },
          },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              profileImage: true,
              bio: true,
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
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const orderDtos: OrderListDto[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        username: order.customer.username,
        email: order.customer.email,
        role: order.customer.role,
        profileImage: order.customer.profileImage || undefined,
      },
      subpackage: {
        id: order.subpackage.id,
        name: order.subpackage.name,
        description: order.subpackage.description,
        price: order.subpackage.price,
        duration: order.subpackage.duration || undefined,
        requiredProviders: order.subpackage.requiredProviders,
        service: {
          id: order.subpackage.service.id,
          name: order.subpackage.service.name,
          game: {
            id: order.subpackage.service.game.id,
            name: order.subpackage.service.game.name,
            image: order.subpackage.service.game.image,
          },
        },
      },
      price: order.price,
      status: order.status,
      rerollsLeft: order.rerollsLeft,
      approvedCount: order.assignments.reduce(
        (acc, val) =>
          ["APPROVED", "COMPLETED", "VERIFIED"].includes(val.status)
            ? acc + 1
            : acc,
        0
      ),
      requiredCount: order.requiredCount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      assignmentsCount: order.assignments.length,
    }));

    return {
      orders: orderDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOrderById(id: string): Promise<OrderDetailDto | null> {
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
        chats: {
          include: {
            sender: {
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
          orderBy: {
            sentAt: "asc",
          },
        },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customer: {
        id: order.customer.id,
        username: order.customer.username,
        email: order.customer.email,
        role: order.customer.role,
        profileImage: order.customer.profileImage || undefined,
      },
      subpackage: {
        id: order.subpackage.id,
        name: order.subpackage.name,
        description: order.subpackage.description,
        price: order.subpackage.price,
        dynamicPricing: order.subpackage.dynamicPricing ?? undefined,
        basePricePerELO: order.subpackage.basePricePerELO ?? undefined,
        minELO: order.subpackage.minELO ?? null,
        maxELO: order.subpackage.maxELO ?? null,
        requiredProviders: order.subpackage.requiredProviders,
        duration: order.subpackage.duration || undefined,
        service: {
          id: order.subpackage.service.id,
          name: order.subpackage.service.name,
          game: {
            id: order.subpackage.service.game.id,
            name: order.subpackage.service.game.name,
            image: order.subpackage.service.game.image,
          },
        },
      },
      price: order.price,
      status: order.status,
      notes: order.notes || undefined,
      cancelReason: order.cancelReason || undefined,
      rerollsLeft: order.rerollsLeft,
      approvedCount: order.assignments.reduce(
        (acc, item) =>
          item.status === "APPROVED" ||
          item.status === "COMPLETED" ||
          item.status === "VERIFIED"
            ? (acc += 1)
            : acc,
        0
      ),
      requiredCount: order.requiredCount,
      stripeSessId: order.stripeSessId || undefined,
      gamesCount: (order as any)?.gamesCount as any,
      rank: (order as any)?.rank as any,
      // include ELO values when present on order
      // provider components already use these fields similarly
      // so we expose them for customer detail too
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      assignments: order.assignments.map((assignment) => ({
        id: assignment.id,
        providerId: assignment.providerId,
        claimedAt: assignment.claimedAt,
        status: assignment.status,
        approved: assignment.status === "APPROVED",
        completed:
          assignment.status === "COMPLETED" || assignment.status === "VERIFIED",
        leftEarly: assignment.leftEarly,
        progress: assignment.progress,
        proofUrl: assignment.proofUrl || undefined,
        reviewRating: assignment.reviewRating || undefined,
        reviewText: assignment.reviewText || undefined,
        provider: {
          id: assignment.provider.id,
          username: assignment.provider.username,
          email: assignment.provider.email,
          role: assignment.provider.role,
          profileImage: assignment.provider.profileImage || undefined,
        },
      })),
      chats: order.chats.map((chat) => ({
        id: chat.id,
        senderId: chat.senderId,
        message: chat.message,
        sentAt: chat.sentAt,
        sender: {
          id: chat.sender.id,
          username: chat.sender.username,
          email: chat.sender.email,
          role: chat.sender.role,
          profileImage: chat.sender.profileImage || undefined,
        },
      })),
    };
  }

  static async updateOrder(
    id: string,
    data: OrderUpdateRequest
  ): Promise<OrderDetailDto | null> {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...data,

        updatedAt: new Date(),
      },
    });

    return this.getOrderById(updatedOrder.id);
  }

  static async updateAssignment(
    assignmentId: string,
    data: AssignmentUpdateRequest
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

  static async getAssignment(assignmentId: string): Promise<any> {
    try {
      const assignment = await prisma.orderAssignment.findUnique({
        where: { id: assignmentId },
        include: { provider: true },
      });
      return assignment;
    } catch (error) {
      console.error("Error getting assignment:", error);
      return false;
    }
  }

  static async deleteOrder(id: string): Promise<boolean> {
    try {
      await prisma.order.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      return false;
    }
  }
  // TESTING GET RECENT ORDDERS FOR CUSTOMERS
  static async getRecentOrdersCustomer(
    params: OrdersListRequest
  ): Promise<CustomerOrderListResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      gameId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(gameId && { subpackage: { service: { gameId } } }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [orders, total, active, completed, totalSpent] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
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
                },
              },
            },
          },
        },
      }),

      prisma.order.count({
        where: {
          customerId,
        },
      }),
      prisma.order.count({
        where: {
          customerId,
          status: "IN_PROGRESS",
        },
      }),
      prisma.order.count({
        where: {
          customerId,
          status: "COMPLETED",
        },
      }),

      prisma.order.aggregate({
        where: { customerId },

        _sum: {
          price: true,
        },
      }),
    ]);

    const orderDtos: CustomerOrderListDto[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,

      subpackage: {
        id: order.subpackage.id,
        name: order.subpackage.name,
        description: order.subpackage.description,
        price: order.subpackage.price,
        duration: order.subpackage.duration || undefined,
        dynamicPricing: order.subpackage.dynamicPricing ?? undefined,
        basePricePerELO: order.subpackage.basePricePerELO ?? undefined,
        minELO: order.subpackage.minELO ?? null,
        maxELO: order.subpackage.maxELO ?? null,
        requiredProviders: order.subpackage.requiredProviders,
        service: {
          id: order.subpackage.service.id,
          name: order.subpackage.service.name,
          game: {
            id: order.subpackage.service.game.id,
            name: order.subpackage.service.game.name,
            image: order.subpackage.service.game.image,
          },
        },
      },
      providers:
        order?.assignments?.map((individualProvider) => {
          return {
            id: individualProvider?.provider?.id,
            username: individualProvider?.provider?.username,
            email: individualProvider?.provider?.email,
            status: individualProvider?.status,
          };
        }) || [],
      price: order.price,
      status: order.status,
      rerollsLeft: order.rerollsLeft,
      approvedCount: order.approvedCount,
      requiredCount: order.requiredCount,
      gamesCount: order.gamesCount as any,
      rank: (order.rank as any) || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return {
      orders: orderDtos,
      active,
      totalSpent: totalSpent?._sum?.price ?? 0,
      completed,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
