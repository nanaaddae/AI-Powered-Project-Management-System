import api from './api';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile/', profileData);
    return response.data;
  },

  updateUserInfo: async (userData) => {
    const response = await api.put('/auth/update-info/', userData);
    return response.data;
  },
};