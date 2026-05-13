import api from './axios';

export const servicesAPI = {
  /**
   * Public — list of available court services (no auth required).
   */
  getServices: async () => {
    const response = await api.get('/services/list/');
    return response.data;
  },

  /**
   * Submit a service request (multipart/form-data for file uploads).
   */
  submitRequest: async (formPayload) => {
    const response = await api.post('/services/submit/', formPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get all service requests submitted by the logged-in user.
   */
  getMyRequests: async () => {
    const response = await api.get('/services/my-requests/');
    return response.data;
  },

  /**
   * Dashboard statistics for the logged-in user.
   */
  getDashboardStats: async () => {
    const response = await api.get('/services/dashboard/stats/');
    return response.data;
  },
};
