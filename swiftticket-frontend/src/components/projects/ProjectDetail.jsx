import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { ticketService } from '../../services/ticketService';
import { ArrowLeft, Plus, Ticket as TicketIcon, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ManageMembersModal from './ManageMembersModal';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectData, allTickets, statsData] = await Promise.all([
        projectService.getById(id),
        ticketService.getAll(),
        projectService.getStats(id).catch(() => null), // Stats might fail, that's ok
      ]);

      setProject(projectData);

      // Filter tickets for this project
      const projectTickets = allTickets.filter(
        ticket => ticket.project?.id == id || ticket.project == id
      );
      setTickets(projectTickets);

      // If stats API failed, calculate manually
      if (!statsData) {
        const calculatedStats = {
          total_tickets: projectTickets.length,
          open_tickets: projectTickets.filter(t => t.status === 'open').length,
          in_progress_tickets: projectTickets.filter(t => t.status === 'in_progress').length,
          completed_tickets: projectTickets.filter(t => t.status === 'done').length,
        };
        setStats(calculatedStats);
      } else {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
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
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  const canManageMembers = user.role === 'admin' || user.role === 'project_manager';

  return (
    <div className="project-detail-container">
      <button onClick={() => navigate('/projects')} className="back-button">
        <ArrowLeft size={20} /> Back to Projects
      </button>

      <div className="project-detail-header">
        <div>
          <span className="project-key-badge">{project.key}</span>
          <h1>{project.name}</h1>
          <p className="project-description">{project.description}</p>
        </div>
        {canManageMembers && (
          <button
            className="manage-members-button"
            onClick={() => setShowMembersModal(true)}
          >
            <Users size={18} /> Manage Members
          </button>
        )}
      </div>

      {stats && (
        <div className="project-stats">
          <div className="stat-card">
            <h3>{stats.total_tickets}</h3>
            <p>Total Tickets</p>
          </div>
          <div className="stat-card">
            <h3>{stats.open_tickets}</h3>
            <p>Open</p>
          </div>
          <div className="stat-card">
            <h3>{stats.in_progress_tickets}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completed_tickets}</h3>
            <p>Completed</p>
          </div>
        </div>
      )}

      <div className="project-tickets-section">
        <div className="section-header">
          <h2>Tickets</h2>
          <button
            className="create-button"
            onClick={() => navigate('/tickets')}
          >
            <Plus size={18} /> Create Ticket
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <TicketIcon size={48} color="#ccc" />
            <p>No tickets in this project yet</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-card-mini"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="ticket-mini-header">
                  <span className="ticket-id">#{ticket.id}</span>
                  <div className="ticket-mini-badges">
                    <span
                      className="badge-mini"
                      style={{ background: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className="badge-mini"
                      style={{ background: getStatusColor(ticket.status) }}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <h4>{ticket.title}</h4>
                <p className="ticket-mini-desc">
                  {ticket.description?.substring(0, 100)}
                  {ticket.description?.length > 100 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMembersModal && (
        <ManageMembersModal
          project={project}
          onClose={() => setShowMembersModal(false)}
          onSuccess={() => {
            setShowMembersModal(false);
            fetchProjectData();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;