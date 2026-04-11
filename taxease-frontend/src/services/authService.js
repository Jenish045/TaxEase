import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { storage } from '../utils/storage';

export const authService = {
  signup: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH_SIGNUP, userData);
    if (response.data.data.accessToken) {
      storage.setAuthToken(response.data.data.accessToken);
      storage.setUserData(response.data.data.user);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    if (response.data.data.accessToken) {
      storage.setAuthToken(response.data.data.accessToken);
      storage.setUserData(response.data.data.user);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT);
    } finally {
      storage.clearAll();
    }
  },

  refreshToken: async () => {
    const refreshToken = storage.getRefreshToken();
    const response = await api.post(API_ENDPOINTS.AUTH_REFRESH, { refreshToken });
    if (response.data.data.accessToken) {
      storage.setAuthToken(response.data.data.accessToken);
    }
    return response.data;
  },

  getCurrentUser: () => {
    return storage.getUserData();
  },

  isAuthenticated: () => {
    return !!storage.getAuthToken();
  }
};