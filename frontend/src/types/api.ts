// Matches backend AuthRequest.java
export interface AuthRequest {
  username: string; // This is the email
  password?: string; // Optional as it might not always be sent back
}

// Matches backend RegisterRequest.java
export interface RegisterRequest {
  name: string;
  username: string; // This is the email
  password?: string; // Optional as it might not always be sent back
}

// Matches backend AuthResponse.java
export interface AuthResponse {
  token: string;
}

// Matches backend UserDTO.java (adjust if needed based on actual DTO)
export interface User {
  id: number;
  name: string;
  username: string; // email
  roles: string[]; // roles are strings like "ROLE_USER"
}

// API error structure (to be adjust based on backend's error responses)
export interface ApiError {
  message: string;
  // TODO: Add other potential error fields: timestamp, details, status, etc.
}

export interface FoodItem {
  id: number;
  cookId: number;
  cookName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  tags: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

// Matches backend CreateFoodItemRequest.java
export interface CreateFoodItemRequest {
  name: string;
  description?: string; // optional
  price: number;
  imageUrl?: string;
  tags?: string[];
  available?: boolean; // Usually defaulted, but allow setting
}

// Matches backend UpdateFoodItemRequest.java
export interface UpdateFoodItemRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
  available: boolean; // required on update
}

// Specific type for update mutation payload
export interface UpdateFoodItemPayload {
  id: number | string;
  data: UpdateFoodItemRequest;
}

export interface OrderItemDTO {
  id: number;
  foodItemId: number;
  foodItemName: string;
  quantity: number;
  priceAtOrderTime: string;  // BigDecimal → string
  foodItemImageUrl: string;
}

// export enum OrderStatus {
//   PENDING = 'PENDING',
//   ACCEPTED = 'ACCEPTED',
//   COOKING = 'COOKING',
//   READY_FOR_PICKUP = 'READY_FOR_PICKUP',
//   OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
//   DELIVERED = 'DELIVERED',
//   CANCELLED = 'CANCELLED'
// }

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'COOKING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderDTO {
  id: number;
  customerId: number;
  customerName: string;
  cookId: number;
  cookName: string;
  deliveryAgentId: number;
  deliveryAgentName: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

export interface CartItemDTO {
  foodItemId: number;
  quantity: number;
}

export interface PlaceOrderRequestDTO {
  items: CartItemDTO[];
  // Future fields (optional, for future use):
  // deliveryAddress?: string;
  // paymentMethodId?: string;
  // specialInstructions?: string;
}

export interface UpdateOrderStatusRequestDTO {
  newStatus: OrderStatus;
}

// Matches backend UserSummaryDTO.java
export interface UserSummary {
  id: number;
  name: string;
  username: string; // email
  roles: string[]; // Array of role strings (e.g., "ROLE_ADMIN")
  enabled: boolean;
}

// Matches backend UserDetailDTO.java
export interface UserDetail extends UserSummary {
  // Potentially add more fields if needed in detail view
}

// Matches backend CreateUserRequestDTO.java
export interface CreateUserRequest {
  name: string;
  username: string;
  password?: string;
  roles: string[];
  enabled?: boolean;
}

// Matches backend UpdateUserRequestDTO.java
export interface UpdateUserRequest {
  name: string;
  username: string;
  roles: string[];
  enabled: boolean;
}

// Matches backend UserProfileDTO.java
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  roles: string[];
}

// Matches backend UpdateProfileRequestDTO.java
export interface UpdateProfileRequest {
  name: string;
}

// Define available roles (sync with backend Role enum)
export const availableRoles = ["ROLE_USER", "ROLE_COOK", "ROLE_DELIVERY_AGENT", "ROLE_ADMIN"] as const;
export type AppRole = typeof availableRoles[number]; // Creates a type like "ROLE_USER" | "ROLE_COOK" | ...