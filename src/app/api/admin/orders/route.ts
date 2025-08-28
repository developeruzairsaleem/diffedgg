import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  OrdersListRequest,
  OrdersListResponse,
  OrderListDto,
  ApiResponse,
} from "@/types/order.dto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: OrdersListRequest = {
      page: searchParams.get("page")
        ? Number.parseInt(searchParams.get("page")!)
        : 1,
      limit: searchParams.get("limit")
        ? Number.parseInt(searchParams.get("limit")!)
        : 10,
      status: (searchParams.get("status") as any) || undefined,
      customerId: searchParams.get("customerId") || undefined,
      gameId: searchParams.get("gameId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    };

    // Inline getOrders logic
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

    const where: any = {
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
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const orderDtos: OrderListDto[] = orders.map((order: any) => ({
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
        (acc: number, val: any) =>
          ["APPROVED", "COMPLETED", "VERIFIED"].includes(val.status)
            ? acc + 1
            : acc,
        0
      ),
      requiredCount: order.requiredCount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      gamesCount: order.gamesCount,
      assignmentsCount: order.assignments.length,
      assignments: order.assignments.map((assignment: any) => ({
        id: assignment.id,
        status: assignment.status,
        provider: assignment.provider
          ? {
              id: assignment.provider.id,
              username: assignment.provider.username,
            }
          : null,
      })),
    }));

    const result: OrdersListResponse = {
      orders: orderDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    const response: ApiResponse<OrdersListResponse> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);

    const response: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch orders",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
