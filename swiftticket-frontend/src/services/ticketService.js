import api from './api';

export const ticketService = {
  // Get all tickets
  getAll: async () => {
    const response = await api.get('/tickets/');
    console.log('Tickets API response:', response.data);

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.results) {
      return response.data.results;
    } else if (response.data.tickets) {
      return response.data.tickets;
    }

    // If it's a single object, wrap it in an array
    return response.data ? [response.data] : [];
  },

  // Get my tickets
  getMyTickets: async () => {
    const response = await api.get('/tickets/my_tickets/');
    return response.data;
  },

  // Get single ticket
  getById: async (id) => {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  },

  // Create ticket
  create: async (ticketData) => {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
  },

  // Update ticket
  update: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}/`, ticketData);
    return response.data;
  },

  // Update ticket status
  updateStatus: async (id, status) => {
    const response = await api.post(`/tickets/${id}/update_status/`, { status });
    return response.data;
  },

  // Delete ticket
  delete: async (id) => {
    const response = await api.delete(`/tickets/${id}/`);
    return response.data;
  },

  // AI Features
  aiClassify: async (title, description) => {
    const response = await api.post('/tickets/ai_classify/', { title, description });
    return response.data;
  },

  aiSummarize: async (id) => {
    const response = await api.post(`/tickets/${id}/ai_summarize/`);
    return response.data;
  },

  aiSuggestAssignee: async (id) => {
    const response = await api.post(`/tickets/${id}/ai_suggest_assignee/`);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/auth/users/');
    return response.data;
  },
};