import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/activityService';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  GitBranch,
  AlertCircle,
  UserPlus,
  UserMinus,
  MessageSquare,
  CheckCircle,
  Clock
} from 'lucide-react';
import './ActivityFeed.css';

const ActivityFeed = ({ ticketId, projectId, limit }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, [ticketId, projectId]);

  const fetchActivities = async () => {
    try {
      let data;
      if (ticketId) {
        data = await activityService.getByTicket(ticketId);
      } else if (projectId) {
        data = await activityService.getByProject(projectId);
      } else {
        data = await activityService.getRecent();
      }

      // Limit results if specified
      if (limit) {
        data = data.slice(0, limit);
      }

      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType) => {
    const iconMap = {
      'ticket_created': <Plus size={16} />,
      'ticket_updated': <Edit size={16} />,
      'ticket_deleted': <Trash2 size={16} />,
      'status_changed': <GitBranch size={16} />,
      'priority_changed': <AlertCircle size={16} />,
      'assigned': <UserPlus size={16} />,
      'unassigned': <UserMinus size={16} />,
      'comment_added': <MessageSquare size={16} />,
      'project_created': <Plus size={16} />,
      'member_added': <UserPlus size={16} />,
      'member_removed': <UserMinus size={16} />,
    };
    return iconMap[actionType] || <Activity size={16} />;
  };

  const getActivityColor = (actionType) => {
    const colorMap = {
      'ticket_created': '#4caf50',
      'ticket_updated': '#2196f3',
      'ticket_deleted': '#f44336',
      'status_changed': '#ff9800',
      'priority_changed': '#9c27b0',
      'assigned': '#00bcd4',
      'unassigned': '#607d8b',
      'comment_added': '#3f51b5',
      'project_created': '#4caf50',
      'member_added': '#00bcd4',
      'member_removed': '#607d8b',
    };
    return colorMap[actionType] || '#999';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleActivityClick = (activity) => {
    if (activity.ticket) {
      navigate(`/tickets/${activity.ticket}`);
    } else if (activity.project) {
      navigate(`/projects/${activity.project}`);
    }
  };

  if (loading) {
    return (
      <div className="activity-feed-loading">
        <Clock size={20} className="spin" />
        <span>Loading activities...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed-empty">
        <Activity size={48} color="#ccc" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="activity-item"
          onClick={() => handleActivityClick(activity)}
          style={{ cursor: activity.ticket || activity.project ? 'pointer' : 'default' }}
        >
          <div
            className="activity-icon"
            style={{ background: getActivityColor(activity.action_type) }}
          >
            {getActivityIcon(activity.action_type)}
          </div>

          <div className="activity-content">
            <div className="activity-header">
              <span className="activity-user">
                {activity.user.first_name} {activity.user.last_name}
              </span>
              <span className="activity-time">{formatTimeAgo(activity.created_at)}</span>
            </div>

            <p className="activity-description">{activity.description}</p>

            {activity.ticket_title && (
              <div className="activity-reference">
                <span className="reference-label">Ticket:</span>
                <span className="reference-value">{activity.ticket_title}</span>
              </div>
            )}

            {activity.project_name && !ticketId && (
              <div className="activity-reference">
                <span className="reference-label">Project:</span>
                <span className="reference-value">{activity.project_name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;