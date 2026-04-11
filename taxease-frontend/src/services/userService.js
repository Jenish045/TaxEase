import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { storage } from '../utils/storage';

export const userService = {
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.USER_UPDATE, profileData);
    if (response.data.data.user) {
      storage.setUserData(response.data.data.user);
    }
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post(API_ENDPOINTS.USER_CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get(API_ENDPOINTS.USER_STATS);
    return response.data;
  }
};