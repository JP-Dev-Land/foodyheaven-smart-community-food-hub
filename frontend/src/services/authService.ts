import { useMutation } from '@tanstack/react-query';
import api from './api';
import { AuthRequest, AuthResponse, RegisterRequest, ApiError } from '../types/api';

// --- Login Mutation Hook ---
const loginUser = async (credentials: AuthRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const useLogin = () => {
  return useMutation<AuthResponse, ApiError, AuthRequest>({
    mutationFn: loginUser,
    //only for debug: (^_^)
    onSuccess: (data) => { // Handled in the component using the hook
      console.log('Login successful', data.token);
    },
    onError: (error) => { // Handled in the component using the hook
      console.error('Login failed:', error.message);
    }
  });
};


// --- Register Mutation Hook ---
const registerUser = async (userData: RegisterRequest): Promise<string> => { // Backend returns ResponseEntity<String>
    // Backend returns plain text on success "User registered successfully"
    const response = await api.post<string>('/auth/register', userData);
    // Axios might parse plain text directly into data. If not, adjust as needed.
    // Check content type if issues arise.
    return response.data;
};

export const useRegister = () => {
    return useMutation<string, ApiError, RegisterRequest>({
        mutationFn: registerUser,
        //only for debug: (^_^)
        onSuccess: (message) => { // Handled in the component
            console.log('Registration successful:', message);
        },
        onError: (error) => { // Handled in the component
            console.error('Registration failed:', error.message);
        },
    });
};