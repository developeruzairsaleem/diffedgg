import { prisma } from "@/lib/prisma";
import type {
  GamesListRequest,
  GamesListResponse,
  GameListDto,
  GameDetailDto,
  ServiceDetailDto,
  ServicesListRequest,
  ServicesListResponse,
  GameUpdateRequest,
  ServiceUpdateRequest,
  SubpackageUpdateRequest,
  GameCreateRequest,
  ServiceCreateRequest,
  SubpackageCreateRequest,
  GameStatsDto,
} from "@/types/game.dto";

export class GameService {
  static async getGames(params: GamesListRequest): Promise<GamesListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isEloBased,
      hasOrders,
      minRevenue,
      maxRevenue,
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(isEloBased !== undefined && { isEloBased }),
      ...(hasOrders !== undefined && {
        services: hasOrders
          ? {
              some: {
                subpackages: {
                  some: {
                    orders: {
                      some: {},
                    },
                  },
                },
              },
            }
          : {
              every: {
                subpackages: {
                  every: {
                    orders: {
                      none: {},
                    },
                  },
                },
              },
            },
      }),
    };

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          services: {
            include: {
              subpackages: {
                include: {
                  orders: {
                    select: {
                      id: true,
                      price: true,
                      status: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.game.count({ where }),
    ]);

    // Calculate game statistics
    const gameDtos: GameListDto[] = games
      .map((game) => {
        const servicesCount = game.services.length;
        const subpackagesCount = game.services.reduce(
          (sum, service) => sum + service.subpackages.length,
          0
        );

        const allOrders = game.services.flatMap((service) =>
          service.subpackages.flatMap((subpackage) => subpackage.orders)
        );

        const ordersCount = allOrders.length;
        const totalRevenue = allOrders.reduce(
          (sum, order) => sum + order.price,
          0
        );
        const averageOrderValue =
          ordersCount > 0 ? totalRevenue / ordersCount : 0;

        const lastOrder = allOrders.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0];

        return {
          id: game.id,
          name: game.name,
          image: game.image,
          isEloBased: game.isEloBased,
          ranks: game.ranks,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          servicesCount,
          subpackagesCount,
          ordersCount,
          totalRevenue,
          averageOrderValue,
          popularityRank: 0, // Will be calculated after sorting
          lastOrderDate: lastOrder?.createdAt,
        };
      })
      .filter((game) => {
        if (minRevenue !== undefined && game.totalRevenue < minRevenue)
          return false;
        if (maxRevenue !== undefined && game.totalRevenue > maxRevenue)
          return false;
        return true;
      })
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .map((game, index) => ({ ...game, popularityRank: index + 1 }));

    // Get overall statistics
    const [totalGames, totalServices, totalSubpackages] = await Promise.all([
      prisma.game.count(),
      prisma.service.count(),
      prisma.subpackage.count(),
    ]);

    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { price: true },
    });

    const mostPopularGameResult = await prisma.game.findFirst({
      include: {
        services: {
          include: {
            subpackages: {
              include: {
                _count: {
                  select: {
                    orders: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        services: {
          _count: "desc",
        },
      },
    });

    const stats = {
      totalGames,
      totalServices,
      totalSubpackages,
      totalRevenue: totalRevenueResult._sum.price || 0,
      averageRevenuePerGame:
        totalGames > 0 ? (totalRevenueResult._sum.price || 0) / totalGames : 0,
      mostPopularGame: mostPopularGameResult?.name || "N/A",
    };

    return {
      games: gameDtos,
      total: gameDtos.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  }

  static async getGameById(id: string): Promise<GameDetailDto | null> {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            subpackages: {
              include: {
                orders: {
                  select: {
                    id: true,
                    price: true,
                    status: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!game) return null;

    // Calculate service statistics
    const services = game.services.map((service) => {
      const subpackages = service.subpackages.map((subpackage) => {
        const ordersCount = subpackage.orders.length;
        const totalRevenue = subpackage.orders.reduce(
          (sum, order) => sum + order.price,
          0
        );

        return {
          id: subpackage.id,
          name: subpackage.name,
          description: subpackage.description,
          price: subpackage.price,
          duration: subpackage.duration || undefined,
          dynamicPricing: subpackage.dynamicPricing,
          ordersCount,
          totalRevenue,
        };
      });

      const serviceOrdersCount = subpackages.reduce(
        (sum, sub) => sum + sub.ordersCount,
        0
      );
      const serviceTotalRevenue = subpackages.reduce(
        (sum, sub) => sum + sub.totalRevenue,
        0
      );

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        subpackagesCount: subpackages.length,
        ordersCount: serviceOrdersCount,
        totalRevenue: serviceTotalRevenue,
        subpackages,
      };
    });

    // Calculate overall game statistics
    const totalServices = services.length;
    const totalSubpackages = services.reduce(
      (sum, service) => sum + service.subpackagesCount,
      0
    );
    const totalOrders = services.reduce(
      (sum, service) => sum + service.ordersCount,
      0
    );
    const totalRevenue = services.reduce(
      (sum, service) => sum + service.totalRevenue,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const allOrders = game.services.flatMap((service) =>
      service.subpackages.flatMap((subpackage) => subpackage.orders)
    );
    const completedOrders = allOrders.filter(
      (order) => order.status === "COMPLETED"
    ).length;
    const pendingOrders = allOrders.filter(
      (order) => order.status === "PENDING"
    ).length;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const topServices = services
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5)
      .map((service) => ({
        serviceName: service.name,
        ordersCount: service.ordersCount,
        revenue: service.totalRevenue,
      }));

    // Calculate revenue by month (last 6 months)
    const now = new Date();
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthOrders = allOrders.filter(
        (order) => order.createdAt >= monthStart && order.createdAt <= monthEnd
      );

      revenueByMonth.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: monthOrders.reduce((sum, order) => sum + order.price, 0),
        orders: monthOrders.length,
      });
    }

    return {
      id: game.id,
      name: game.name,
      image: game.image,
      isEloBased: game.isEloBased,
      ranks: game.ranks,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      services,
      stats: {
        totalServices,
        totalSubpackages,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        completionRate,
        topServices,
        revenueByMonth,
      },
    };
  }

  static async getServices(
    params: ServicesListRequest
  ): Promise<ServicesListResponse> {
    const {
      page = 1,
      limit = 10,
      gameId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    const where = {
      ...(gameId && { gameId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [services, total, games] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          subpackages: {
            include: {
              orders: {
                select: {
                  id: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.service.count({ where }),
      prisma.game.findMany({
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
    ]);

    const serviceDtos = services.map((service) => {
      const subpackagesCount = service.subpackages.length;
      const ordersCount = service.subpackages.reduce(
        (sum, sub) => sum + sub.orders.length,
        0
      );
      const totalRevenue = service.subpackages.reduce(
        (sum, sub) =>
          sum +
          sub.orders.reduce((orderSum, order) => orderSum + order.price, 0),
        0
      );

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        gameId: service.gameId,
        game: service.game,
        subpackagesCount,
        ordersCount,
        totalRevenue,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });

    return {
      services: serviceDtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      games,
    };
  }

  static async getServiceById(id: string): Promise<ServiceDetailDto | null> {
    const getServices = prisma.service.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        subpackages: {
          include: {
            orders: {
              include: {
                assignments: {
                  select: {
                    reviewRating: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const [service, games] = await Promise.all([
      getServices,
      prisma.game.findMany({
        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
    ]);

    if (!service) return null;

    const subpackages = service.subpackages.map((subpackage) => {
      const ordersCount = subpackage.orders.length;
      const totalRevenue = subpackage.orders.reduce(
        (sum, order) => sum + order.price,
        0
      );

      const ratings = subpackage.orders.flatMap((order) =>
        order.assignments
          .filter((a) => a.reviewRating)
          .map((a) => a.reviewRating!)
      );
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      return {
        id: subpackage.id,
        name: subpackage.name,
        description: subpackage.description,
        price: subpackage.price,
        duration: subpackage.duration || undefined,
        dynamicPricing: subpackage.dynamicPricing,
        basePricePerELO: subpackage.basePricePerELO || undefined,
        minELO: subpackage.minELO || undefined,
        maxELO: subpackage.maxELO || undefined,
        requiredProviders: subpackage.requiredProviders,
        ordersCount,
        totalRevenue,
        averageRating,
      };
    });

    const totalSubpackages = subpackages.length;
    const totalOrders = subpackages.reduce(
      (sum, sub) => sum + sub.ordersCount,
      0
    );
    const totalRevenue = subpackages.reduce(
      (sum, sub) => sum + sub.totalRevenue,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const allOrders = service.subpackages.flatMap((sub) => sub.orders);
    const completedOrders = allOrders.filter(
      (order) => order.status === "COMPLETED"
    ).length;
    const completionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      gameId: service.gameId,
      game: service.game,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      subpackages,
      stats: {
        totalSubpackages,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        completionRate,
      },
      allGames: games,
    };
  }

  // CRUD Operations
  static async createGame(data: GameCreateRequest): Promise<GameDetailDto> {
    const game = await prisma.game.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.getGameById(game.id) as Promise<GameDetailDto>;
  }

  static async updateGame(
    id: string,
    data: GameUpdateRequest
  ): Promise<GameDetailDto | null> {
    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return this.getGameById(updatedGame.id);
  }

  static async deleteGame(id: string): Promise<boolean> {
    try {
      await prisma.game.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting game:", error);
      return false;
    }
  }

  static async createService(
    data: ServiceCreateRequest
  ): Promise<ServiceDetailDto> {
    const service = await prisma.service.create({
      data: {
        ...data,
      },
    });

    return this.getServiceById(service.id) as Promise<ServiceDetailDto>;
  }

  static async updateService(
    id: string,
    data: ServiceUpdateRequest
  ): Promise<ServiceDetailDto | null> {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return this.getServiceById(updatedService.id);
  }

  static async deleteService(id: string): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      return false;
    }
  }

  static async createSubpackage(data: SubpackageCreateRequest) {
    return await prisma.subpackage.create({
      data: {
        ...data,
        requiredProviders: Number(data?.requiredProviders) || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  static async updateSubpackage(id: string, data: SubpackageUpdateRequest) {
    return await prisma.subpackage.update({
      where: { id },
      data: {
        ...data,
        ...(data.requiredProviders && {
          requiredProviders: Number(data.requiredProviders),
        }),
        updatedAt: new Date(),
      },
    });
  }

  static async deleteSubpackage(id: string): Promise<boolean> {
    try {
      await prisma.subpackage.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting subpackage:", error);
      return false;
    }
  }

  static async getGameStats(): Promise<GameStatsDto> {
    const [totalGames, totalServices, totalSubpackages] = await Promise.all([
      prisma.game.count(),
      prisma.service.count(),
      prisma.subpackage.count(),
    ]);

    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { price: true },
    });

    // Get top performing games
    const gamesWithStats = await prisma.game.findMany({
      include: {
        services: {
          include: {
            subpackages: {
              include: {
                orders: {
                  select: {
                    id: true,
                    price: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 5,
    });

    const topPerformingGames = gamesWithStats
      .map((game) => {
        const allOrders = game.services.flatMap((service) =>
          service.subpackages.flatMap((subpackage) => subpackage.orders)
        );
        const ordersCount = allOrders.length;
        const revenue = allOrders.reduce((sum, order) => sum + order.price, 0);
        const completedOrders = allOrders.filter(
          (order) => order.status === "COMPLETED"
        ).length;
        const completionRate =
          ordersCount > 0 ? (completedOrders / ordersCount) * 100 : 0;

        return {
          id: game.id,
          name: game.name,
          image: game.image,
          ordersCount,
          revenue,
          completionRate,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get revenue by game
    const revenueByGame = gamesWithStats.map((game) => {
      const allOrders = game.services.flatMap((service) =>
        service.subpackages.flatMap((subpackage) => subpackage.orders)
      );
      const revenue = allOrders.reduce((sum, order) => sum + order.price, 0);

      return {
        gameName: game.name,
        revenue,
        orders: allOrders.length,
        services: game.services.length,
      };
    });

    // Get service popularity
    const servicesWithStats = await prisma.service.findMany({
      include: {
        game: {
          select: {
            name: true,
          },
        },
        subpackages: {
          include: {
            orders: {
              select: {
                id: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const servicePopularity = servicesWithStats
      .map((service) => {
        const allOrders = service.subpackages.flatMap((sub) => sub.orders);
        const ordersCount = allOrders.length;
        const revenue = allOrders.reduce((sum, order) => sum + order.price, 0);

        return {
          serviceName: service.name,
          gameName: service.game.name,
          ordersCount,
          revenue,
        };
      })
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 10);

    return {
      totalGames,
      totalServices,
      totalSubpackages,
      totalRevenue: totalRevenueResult._sum.price || 0,
      topPerformingGames,
      revenueByGame,
      servicePopularity,
    };
  }
}
