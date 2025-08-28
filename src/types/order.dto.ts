import type {
  OrderStatus,
  OrderAssignmentStatus,
  Role,
} from "@/generated/prisma";

// Base DTOs
export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: Role;
  profileImage?: string;
  bio?: string;
}

export interface SubpackageDto {
  id: string;
  name: string;
  requiredProviders: number;
  description: string;
  price: number;
  duration?: string;
  dynamicPricing?: boolean;
  basePricePerELO?: number;
  minELO?: number | null;
  maxELO?: number | null;
  service: {
    id: string;
    name: string;
    game: {
      id: string;
      name: string;
      image: string;
    };
  };
}

export interface OrderAssignmentDto {
  id: string;
  providerId: string;
  claimedAt: Date;
  status: OrderAssignmentStatus;
  approved: boolean;
  completed: boolean;
  leftEarly: boolean;
  progress: number;
  proofUrl?: string;
  reviewRating?: number;
  reviewText?: string;
  provider: UserDto;
  gamePlay?: number;
  communication?: number;
  attitude?: number;
  tipAmount?: number;
}

export interface ChatDto {
  id: string;
  senderId: string;
  message: string;
  sentAt: Date;
  sender: UserDto;
}

// Order DTOs
export interface OrderListDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: UserDto;
  subpackage: SubpackageDto;
  price: number;
  status: OrderStatus;
  rerollsLeft: number;
  approvedCount: number;
  requiredCount: number;
  createdAt: Date;
  updatedAt: Date;
  assignmentsCount: number;
  assignments?: OrderAssignmentDto[];
}

// Order DTOs
export interface CustomerOrderListDto {
  id: string;
  orderNumber: string;
  customerId: string;
  subpackage: SubpackageDto;
  price: number;
  status: OrderStatus;
  rerollsLeft: number;
  approvedCount: number;
  requiredCount: number;
  gamesCount?: number;
  rank?: { name?: string; additionalCost?: number } | null;
  createdAt: Date;
  updatedAt: Date;
  providers: Array<{
    id: string;
    username: string;
    email: string;
    status: string;
  }>;
}

export interface OrderDetailDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: UserDto;
  subpackage: SubpackageDto;
  price: number;
  status: OrderStatus;
  notes?: string;
  cancelReason?: string;
  rerollsLeft: number;
  approvedCount: number;
  requiredCount: number;
  stripeSessId?: string;
  gamesCount?: number;
  rank?: { name?: string; additionalCost?: number } | null;
  currentELO?: number | null;
  targetELO?: number | null;
  createdAt: Date;
  updatedAt: Date;
  assignments: OrderAssignmentDto[];
  chats: ChatDto[];
  providerId?: string;
}

// API Request/Response DTOs
export interface OrdersListRequest {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  gameId?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "price";
  sortOrder?: "asc" | "desc";
}

export interface OrdersListResponse {
  orders: OrderListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerOrderListResponse {
  orders: CustomerOrderListDto[];
  total: number;
  active: number;
  completed: number;
  totalSpent: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  notes?: string;
  cancelReason?: string;
  rerollsLeft?: number;
  requiredCount?: number;
}

export interface AssignmentUpdateRequest {
  status?: OrderAssignmentStatus;
  approved?: boolean;
  completed?: boolean;
  progress?: number;
  proofUrl?: string;
  reviewRating?: number;
  reviewText?: string;
  gamePlay?: number;
  communication?: number;
  attitude?: number;
  tipAmount?: number;
  providerId?: string;
}

export interface AssignmentUpdateRequestShabir {
  status?: OrderAssignmentStatus;
  approved?: boolean;
  completed?: boolean;
  progress?: number;
  proofUrl?: string;
  reviewRating?: number;
  reviewText: string;
  gamePlay?: number;
  communication?: number;
  attitude?: number;
  tipAmount?: number;
  providerId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
