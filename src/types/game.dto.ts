// Base Game DTOs
export interface GameDto {
  id: string;
  name: string;
  image: string;
  isEloBased: boolean;
  ranks: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  gameId: string;
  game: GameDto;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubpackageDto {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  dynamicPricing: boolean;
  basePricePerELO?: number;
  requiredProviders: number;
  minELO?: number;
  maxELO?: number;
  serviceId: string;
  service: ServiceDto;
  createdAt: Date;
  updatedAt: Date;
}

// Game List DTO
export interface GameListDto {
  id: string;
  name: string;
  image: string;
  isEloBased: boolean;
  ranks: any;
  createdAt: Date;
  updatedAt: Date;
  servicesCount: number;
  subpackagesCount: number;
  ordersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularityRank: number;
  lastOrderDate?: Date;
}

// Game Detail DTO
export interface GameDetailDto {
  id: string;
  name: string;
  image: string;
  isEloBased: boolean;
  ranks: any;
  createdAt: Date;
  updatedAt: Date;
  services: Array<{
    id: string;
    name: string;
    description: string;
    subpackagesCount: number;
    ordersCount: number;
    totalRevenue: number;
    subpackages: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      duration?: string;
      dynamicPricing: boolean;
      ordersCount: number;
      totalRevenue: number;
    }>;
  }>;
  stats: {
    totalServices: number;
    totalSubpackages: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
    completionRate: number;
    topServices: Array<{
      serviceName: string;
      ordersCount: number;
      revenue: number;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
  };
}

// Service Detail DTO
export interface ServiceDetailDto {
  id: string;
  name: string;
  description: string;
  gameId: string;
  game: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: Date;
  updatedAt: Date;
  subpackages: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    requiredProviders: number;
    duration?: string;
    dynamicPricing: boolean;
    basePricePerELO?: number;
    minELO?: number;
    maxELO?: number;
    ordersCount: number;
    totalRevenue: number;
    averageRating: number;
  }>;
  stats: {
    totalSubpackages: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completedOrders: number;
    completionRate: number;
  };
  allGames: Array<{
    id: string;
    name: string;
    image: string;
  }>;
}

// API Request/Response DTOs
export interface GamesListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "totalRevenue" | "ordersCount";
  sortOrder?: "asc" | "desc";
  isEloBased?: boolean;
  hasOrders?: boolean;
  minRevenue?: number;
  maxRevenue?: number;
}

export interface GamesListResponse {
  games: GameListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalGames: number;
    totalServices: number;
    totalSubpackages: number;
    totalRevenue: number;
    averageRevenuePerGame: number;
    mostPopularGame: string;
  };
}

export interface ServicesListRequest {
  page?: number;
  limit?: number;
  gameId?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "name" | "totalRevenue";
  sortOrder?: "asc" | "desc";
}

export interface ServicesListResponse {
  services: Array<{
    id: string;
    name: string;
    description: string;
    gameId: string;
    game: {
      id: string;
      name: string;
      image: string;
    };
    subpackagesCount: number;
    ordersCount: number;
    totalRevenue: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  games: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GameUpdateRequest {
  name?: string;
  image?: string;
  isEloBased?: boolean;
  ranks?: any;
}

export interface ServiceUpdateRequest {
  name?: string;
  description?: string;
  gameId?: string;
}

export interface SubpackageUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  dynamicPricing?: boolean;
  basePricePerELO?: number;
  minELO?: number;
  maxELO?: number;
  serviceId?: string;
  requiredProviders?: number;
}

export interface GameCreateRequest {
  name: string;
  image: string;
  isEloBased: boolean;
  ranks: any;
}

export interface ServiceCreateRequest {
  name: string;
  description: string;
  gameId: string;
}

export interface SubpackageCreateRequest {
  name: string;
  description: string;
  price: number;
  requiredProviders?: number;
  duration?: string;
  dynamicPricing: boolean;
  basePricePerELO?: number;
  minELO?: number;
  maxELO?: number;
  serviceId: string;
  type: "pergame" | "perteammate";
  ranks?: Array<{ name: string; additionalCost: number }>;
}

export interface GameStatsDto {
  totalGames: number;
  totalServices: number;
  totalSubpackages: number;
  totalRevenue: number;
  topPerformingGames: Array<{
    id: string;
    name: string;
    image: string;
    ordersCount: number;
    revenue: number;
    completionRate: number;
  }>;
  revenueByGame: Array<{
    gameName: string;
    revenue: number;
    orders: number;
    services: number;
  }>;
  servicePopularity: Array<{
    serviceName: string;
    gameName: string;
    ordersCount: number;
    revenue: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
