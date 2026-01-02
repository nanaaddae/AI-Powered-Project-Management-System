import api from './api';

export const projectService = {
  // Get all projects
  getAll: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },

  // Get single project
  getById: async (id) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  // Create project
  create: async (projectData) => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },

  // Update project
  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}/`, projectData);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}/`);
    return response.data;
  },

  // Get project stats
  getStats: async (id) => {
    const response = await api.get(`/projects/${id}/stats/`);
    return response.data;
  },

    addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/add_member/`, {
      user_id: userId
    });
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/remove_member/`, {
      user_id: userId
    });
    return response.data;
  },

  getAvailableUsers: async () => {
    const response = await api.get('/projects/available_users/');
    return response.data;
  },
};