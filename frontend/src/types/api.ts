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