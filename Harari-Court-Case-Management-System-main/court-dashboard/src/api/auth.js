import api from './axios';

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/accounts/login/', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/accounts/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/accounts/profile/');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/accounts/profile/', userData);
    return response.data;
  },
};
