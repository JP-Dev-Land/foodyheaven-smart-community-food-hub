import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getToken, setToken as saveToken, clearToken as removeToken } from '../utils/localStorage';
import { User } from '../types/api';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  user: User | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (newToken: string) => void;
  logout: () => void;
  setUserData: (userData: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for token in localStorage on initial mount
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      // Fetch user profile based on token here
      fetchUserProfile(storedToken);
    }
    setIsLoading(false); // Finished initial check
  }, []);

  const login = useCallback((newToken: string) => {
    saveToken(newToken);
    setToken(newToken);
     // Fetch user profile after login
    fetchUserProfile(newToken);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null); // Clear user data
    // Redirect to login page
    navigate('/login');
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async (currentToken: string) => {
    try {
      const response = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${currentToken}` } // Ensure token is fresh
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout(); // Log out if profile fetch fails (e.g., invalid token)
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    setUserData: setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};