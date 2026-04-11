import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = storage.getUserData();
      const token = storage.getAuthToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    storage.setUserData(userData);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};