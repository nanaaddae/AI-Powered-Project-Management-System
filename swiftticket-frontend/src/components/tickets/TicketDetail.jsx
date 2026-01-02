import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Sparkles, User, Calendar, Edit2, X } from 'lucide-react';
import './TicketDetail.css';
import ActivityFeed from '../activity/ActivityFeed';
// Edit Ticket Modal Component
const EditTicketModal = ({ ticket, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: ticket.title,
    description: ticket.description,
    ticket_type: ticket.ticket_type,
    priority: ticket.priority,
    component: ticket.component || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ticketService.update(ticket.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Ticket</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
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

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.ticket_type}
                onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                required
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
                required
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
              <option value="">Select Component</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="api">API</option>
              <option value="database">Database</option>
              <option value="mobile">Mobile</option>
              <option value="devops">DevOps</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Ticket Detail Component
const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await ticketService.updateStatus(id, newStatus);
      setTicket({ ...ticket, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAISummarize = async () => {
    setAiLoading(true);
    try {
      const response = await ticketService.aiSummarize(id);
      console.log('AI Response:', response);

      let newSummary = response.summary || response.data?.summary;

      if (!newSummary || newSummary.trim() === '' || newSummary === '""') {
        alert('AI returned an empty summary. Try again or check LMStudio.');
        return;
      }

      // Clean up the summary - remove the "Here is a summary" prefix if present
      newSummary = newSummary.replace(/^Here is a summary.*?:\s*/i, '');

      setTicket({ ...ticket, summary: newSummary });
    } catch (error) {
      console.error('AI summarization failed:', error);
      alert('AI summarization failed. Make sure LMStudio is running.');
    } finally {
      setAiLoading(false);
    }
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
    return <div className="loading">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  const canUpdateStatus = user.role === 'developer' || user.role === 'admin';
  const canUseAI = user.role === 'project_manager' || user.role === 'admin';
  const canReassign = user.role === 'project_manager' || user.role === 'admin';
  const canEdit = user.role === 'project_manager' || user.role === 'admin';

  return (
    <div className="ticket-detail-container">
      <button onClick={() => navigate('/tickets')} className="back-button">
        <ArrowLeft size={20} /> Back to Tickets
      </button>

      <div className="ticket-detail-header">
        <div>
          <span className="ticket-id">#{ticket.id}</span>
          <h1>{ticket.title}</h1>
        </div>
        {canEdit && (
          <button
            className="edit-button"
            onClick={() => setShowEditModal(true)}
          >
            <Edit2 size={18} /> Edit Ticket
          </button>
        )}
        <div className="ticket-header-badges">
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
          <span className="badge type-badge">
            {ticket.ticket_type}
          </span>
        </div>
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-main">
          <div className="detail-section">
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          {ticket.summary && (
            <div className="detail-section">
              <h3>AI Summary</h3>
              <p className="ai-summary">{ticket.summary}</p>
            </div>
          )}

          {canUseAI && !ticket.summary && (
            <button
              onClick={handleAISummarize}
              disabled={aiLoading}
              className="ai-button"
            >
              <Sparkles size={16} />
              {aiLoading ? 'Generating Summary...' : 'Generate AI Summary'}
            </button>
          )}

          {canUpdateStatus && (
            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                <button
                  onClick={() => handleStatusChange('open')}
                  disabled={updating || ticket.status === 'open'}
                  className="status-button"
                >
                  Open
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updating || ticket.status === 'in_progress'}
                  className="status-button"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('in_review')}
                  disabled={updating || ticket.status === 'in_review'}
                  className="status-button"
                >
                  In Review
                </button>
                <button
                  onClick={() => handleStatusChange('done')}
                  disabled={updating || ticket.status === 'done'}
                  className="status-button"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {canReassign && (
            <div className="detail-section">
              <h3>Reassign Ticket</h3>
              <ReassignSection ticket={ticket} onUpdate={fetchTicket} />
            </div>
          )}
        </div>

        <div className="detail-section">
  <h3>Activity</h3>
  <ActivityFeed ticketId={ticket.id} />
</div>


        <div className="ticket-sidebar">
          <div className="sidebar-section">
            <h4>Details</h4>
            <div className="detail-item">
              <span className="detail-label">Project</span>
              <span className="detail-value">
                {ticket.project?.name || 'Unknown'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Component</span>
              <span className="detail-value">{ticket.component || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By</span>
              <span className="detail-value">
                <User size={14} />
                {ticket.created_by?.first_name} {ticket.created_by?.last_name}
              </span>
            </div>
            {ticket.assigned_to && (
              <div className="detail-item">
                <span className="detail-label">Assigned To</span>
                <span className="detail-value">
                  <User size={14} />
                  {ticket.assigned_to.first_name} {ticket.assigned_to.last_name}
                </span>
              </div>
            )}
            {!ticket.assigned_to && (
              <div className="detail-item">
                <span className="detail-label">Assigned To</span>
                <span className="detail-value unassigned">
                  Unassigned
                </span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                <Calendar size={14} />
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Updated</span>
              <span className="detail-value">
                <Calendar size={14} />
                {new Date(ticket.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTicketModal
          ticket={ticket}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchTicket();
          }}
        />
      )}
    </div>
  );
};

// Reassign Section Component
const ReassignSection = ({ ticket, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(ticket.assigned_to?.id || '');
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ticketService.getUsers();
        const availableUsers = response.filter(
          u => u.role === 'developer' || u.role === 'admin'
        );
        setUsers(availableUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleAISuggest = async () => {
    setSuggesting(true);
    try {
      const response = await ticketService.aiSuggestAssignee(ticket.id);
      console.log('AI Suggestion:', response);

      const suggestedUsername = response.suggested_assignee;

      if (!suggestedUsername) {
        alert('AI could not suggest an assignee. Try manually assigning.');
        return;
      }

      // Find the user ID from username
      const suggestedUser = users.find(u => u.username === suggestedUsername);

      if (suggestedUser) {
        setSelectedUser(suggestedUser.id);
        alert(`AI suggests assigning to: ${suggestedUser.first_name} ${suggestedUser.last_name}`);
      } else {
        alert(`AI suggested: ${suggestedUsername}, but user not found in available users.`);
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      alert('AI suggestion failed. Make sure LMStudio is running.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleReassign = async () => {
    setLoading(true);
    try {
      await ticketService.update(ticket.id, {
        assigned_to_id: selectedUser || null
      });
      alert('Ticket reassigned successfully!');
      onUpdate();
    } catch (error) {
      console.error('Failed to reassign:', error);
      alert('Failed to reassign ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="reassign-container">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="reassign-select"
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} ({user.username})
            </option>
          ))}
        </select>
        <button
          onClick={handleReassign}
          disabled={loading || selectedUser == ticket.assigned_to?.id}
          className="reassign-button"
        >
          {loading ? 'Updating...' : 'Reassign'}
        </button>
      </div>

      {/* AI Suggest Button */}
      <button
        onClick={handleAISuggest}
        disabled={suggesting}
        className="ai-suggest-full-button"
        style={{ marginTop: '10px' }}
      >
        <Sparkles size={16} />
        {suggesting ? 'Getting AI Suggestion...' : 'AI Suggest Best Developer'}
      </button>
    </div>
  );
};

export default TicketDetail;