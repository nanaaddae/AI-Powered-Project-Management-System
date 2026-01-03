import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { projectService } from '../../services/projectService';
import { Ticket, Folder, CheckCircle, Clock } from 'lucide-react';
import './Dashboard.css';
import ActivityFeed from '../activity/ActivityFeed';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    myTickets: 0,
    inProgress: 0,
    completed: 0,
    totalProjects: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [allTickets, projects] = await Promise.all([
        ticketService.getAll(),
        projectService.getAll(),
      ]);

      // Calculate stats based on user role
      let myTickets = allTickets;

      if (user.role === 'developer') {
        myTickets = allTickets.filter(
          ticket => ticket.assigned_to?.id === user.id || ticket.created_by?.id === user.id
        );
      }

      const statsData = {
        totalTickets: allTickets.length,
        myTickets: myTickets.length,
        inProgress: myTickets.filter(t => t.status === 'in_progress').length,
        completed: myTickets.filter(t => t.status === 'done').length,
        totalProjects: projects.length,
      };

      setStats(statsData);

      // Get 5 most recent tickets (for the user)
      const recent = myTickets
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentTickets(recent);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.first_name || user?.username}!</h1>
        <p className="user-role">Role: <strong>{user?.role?.replace('_', ' ')}</strong></p>
      </div>

      {/* Stats Cards - Fixed Height */}
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/projects')}>
          <div className="card-icon" style={{ background: '#e3f2fd' }}>
            <Folder size={32} color="#2196f3" />
          </div>
          <div className="card-content">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/tickets')}>
          <div className="card-icon" style={{ background: '#f3e5f5' }}>
            <Ticket size={32} color="#9c27b0" />
          </div>
          <div className="card-content">
            <h3>{user.role === 'developer' ? stats.myTickets : stats.totalTickets}</h3>
            <p>{user.role === 'developer' ? 'My Tickets' : 'Total Tickets'}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon" style={{ background: '#fff3e0' }}>
            <Clock size={32} color="#ff9800" />
          </div>
          <div className="card-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon" style={{ background: '#e8f5e9' }}>
            <CheckCircle size={32} color="#4caf50" />
          </div>
          <div className="card-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Activity Section - Separate from stats grid */}
      <div className="dashboard-section activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-container">
          <ActivityFeed limit={10} />
        </div>
      </div>

      {/* Recent Tickets */}
      {recentTickets.length > 0 && (
        <div className="recent-tickets-section">
          <h2>Recent Tickets</h2>
          <div className="recent-tickets-list">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="recent-ticket-item"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="recent-ticket-header">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span
                    className="priority-badge"
                    style={{ background: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <h4>{ticket.title}</h4>
                <p className="recent-ticket-project">
                  {ticket.project?.name || 'Unknown Project'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;