import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Ticket, Sparkles } from 'lucide-react';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    project: '',
    assignedTo: 'all', // all, me, unassigned
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever tickets or filters change
  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchData = async () => {
    try {
      const [ticketsData, projectsData] = await Promise.all([
        ticketService.getAll(),
        projectService.getAll(),
      ]);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setTickets([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tickets];

    // Search filter (title + description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        ticket =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }

    // Project filter
    if (filters.project) {
      result = result.filter(
        ticket => ticket.project?.id == filters.project || ticket.project == filters.project
      );
    }

    // Assigned to filter
    if (filters.assignedTo === 'me') {
      result = result.filter(ticket => ticket.assigned_to?.id === user.id);
    } else if (filters.assignedTo === 'unassigned') {
      result = result.filter(ticket => !ticket.assigned_to);
    }

    setFilteredTickets(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      project: '',
      assignedTo: 'all',
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0',
    };
    return colors[priority] || '#999';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#2196f3',
      in_progress: '#ff9800',
      in_review: '#9c27b0',
      done: '#4caf50',
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Tickets</h1>
        {(user.role === 'admin' || user.role === 'project_manager') && (
          <button
            className="create-button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} /> Create Ticket
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tickets by title or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          >
            <option value="all">All Tickets</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>

        <div className="filter-results">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="empty-state">
          <Ticket size={64} color="#ccc" />
          <h3>No tickets found</h3>
          <p>{tickets.length === 0 ? 'Create your first ticket to get started' : 'Try adjusting your filters'}</p>
        </div>
      ) : (
        <div className="tickets-list">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="ticket-card-header">
                <div>
                  <span className="ticket-id">#{ticket.id}</span>
                  <h3>{ticket.title}</h3>
                </div>
                <div className="ticket-badges">
                  <span
                    className="badge priority-badge"
                    style={{ background: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className="badge status-badge"
                    style={{ background: getStatusColor(ticket.status) }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className="ticket-description">
                {ticket.description?.substring(0, 150)}
                {ticket.description?.length > 150 ? '...' : ''}
              </p>
              <div className="ticket-meta">
                <span>
                  Project: {ticket.project?.name || 'Unknown'}
                </span>
                {ticket.assigned_to && (
                  <span>
                    Assigned: {ticket.assigned_to.first_name} {ticket.assigned_to.last_name}
                  </span>
                )}
                {!ticket.assigned_to && (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>
                    Unassigned
                  </span>
                )}
                <span>
                  Type: {ticket.ticket_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTicketModal
          projects={projects}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const CreateTicketModal = ({ projects, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    ticket_type: 'bug',
    priority: 'medium',
    assigned_to: '',
    component: 'backend', // ← Add default component
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [error, setError] = useState('');

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await ticketService.getUsers();
        const availableUsers = usersData.filter(
          u => u.role === 'developer' || u.role === 'admin'
        );
        setUsers(availableUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleAIClassify = async () => {
    if (!formData.title && !formData.description) {
      setError('Please enter a title or description first');
      return;
    }

    setClassifying(true);
    setError('');

    try {
      const classification = await ticketService.aiClassify(
        formData.title,
        formData.description
      );

      setFormData({
        ...formData,
        ticket_type: classification.type || formData.ticket_type,
        priority: classification.priority || formData.priority,
        component: classification.component || formData.component,
      });
    } catch (err) {
      setError('AI classification failed. Please classify manually.');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build the ticket data with correct field names for Django
      const ticketData = {
        title: formData.title,
        description: formData.description,
        project_id: parseInt(formData.project),
        ticket_type: formData.ticket_type,
        priority: formData.priority,
        component: formData.component,
      };

      // Only add assigned_to_id if a user is selected
      if (formData.assigned_to && formData.assigned_to !== '') {
        ticketData.assigned_to_id = parseInt(formData.assigned_to);
      }

      console.log('Sending ticket data:', ticketData);
      const response = await ticketService.create(ticketData);
      console.log('Response:', response);
      onSuccess();
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);

      // Display detailed error
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          setError(errorMessages);
        } else {
          setError(errorData.toString());
        }
      } else {
        setError('Failed to create ticket. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleAIClassify}
            disabled={classifying}
            className="ai-button"
          >
            <Sparkles size={16} />
            {classifying ? 'Classifying...' : 'AI Classify'}
          </button>

          <div className="form-row">
            <div className="form-group">
              <label>Project *</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                required
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.ticket_type}
                onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="task">Task</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Component</label>
            <select
              value={formData.component}
              onChange={(e) => setFormData({ ...formData, component: e.target.value })}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="api">API</option>
              <option value="database">Database</option>
              <option value="mobile">Mobile</option>
              <option value="devops">DevOps</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assign To</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.username}) - {user.role}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message" style={{ whiteSpace: 'pre-line' }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketList;