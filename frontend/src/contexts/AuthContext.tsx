// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getToken, setToken as saveToken, clearToken as removeToken } from '../utils/localStorage';
import { UserProfile } from '../types/api';
import api from '../services/api';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (currentToken: string): Promise<UserProfile | null> => {
    console.log("Attempting to fetch user profile...");
    try {
        // Use the api instance which includes the interceptor
      const response = await api.get<UserProfile>('/users/me');
      console.log("User profile fetched successfully:", response.data);
      return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Failed to fetch user profile:", axiosError.response?.data || axiosError.message);
        // If profile fetch fails (e.g., invalid token), treat as logged out
        return null;
    }
  }, []);


  // Effect to check token and fetch profile on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const storedToken = getToken();
      if (storedToken) {
        console.log("Token found in storage:", storedToken);
        setToken(storedToken);
        const profile = await fetchUserProfile(storedToken);
        if (profile) {
          setUser(profile);
        } else {
          // If profile fetch failed with stored token, clear it
          removeToken();
          setToken(null);
        }
      } else {
        console.log("No token found in storage.");
        // Ensure state is clear if no token
        setToken(null);
        setUser(null);
      }
      setIsLoading(false); // Finished initial check
    };
    checkAuthStatus();
  }, [fetchUserProfile]); // Dependency: fetchUserProfile


  const login = useCallback(async (newToken: string) => {
    setIsLoading(true); 
    console.log("Login function called, setting token:", newToken);
    saveToken(newToken);
    setToken(newToken);
    const profile = await fetchUserProfile(newToken);
    if (profile) {
      setUser(profile);
    } else {
      // Should ideally not happen if login succeeded, but handled defensively
      removeToken();
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    console.log("Logout function called.");
    removeToken();
    setToken(null);
    setUser(null);
    // Redirect to login page
    navigate('/login');
  }, []);


  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  };

  if (isLoading && !user && !token) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Spinner size="lg" />
              {/* <span>Loading Application...</span> */}
          </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};