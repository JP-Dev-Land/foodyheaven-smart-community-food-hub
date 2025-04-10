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