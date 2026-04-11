const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  PREFERENCES: 'user_preferences'
};

export const storage = {
  // Token management
  setAuthToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getAuthToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeAuthToken: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setRefreshToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getRefreshToken: () => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  removeRefreshToken: () => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User data management
  setUserData: (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  getUserData: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  removeUserData: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // Preferences
  setPreferences: (preferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  },

  getPreferences: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : {};
  },

  // Clear all
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};