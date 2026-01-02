import api from './api';

export const activityService = {
  // Get all activities (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.ticket) params.append('ticket', filters.ticket);
    if (filters.project) params.append('project', filters.project);

    const response = await api.get(`/activities/?${params.toString()}`);
    return response.data;
  },

  // Get recent activities (last 20)
  getRecent: async () => {
    const response = await api.get('/activities/recent/');
    return response.data;
  },

  // Get activities for a specific ticket
  getByTicket: async (ticketId) => {
    const response = await api.get(`/activities/?ticket=${ticketId}`);
    return response.data;
  },

  // Get activities for a specific project
  getByProject: async (projectId) => {
    const response = await api.get(`/activities/?project=${projectId}`);
    return response.data;
  },
};