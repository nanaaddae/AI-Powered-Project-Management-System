import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { X, UserPlus, UserMinus } from 'lucide-react';
import './Modals.css';

const ManageMembersModal = ({ project, onClose, onSuccess }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const users = await projectService.getAvailableUsers();
      setAvailableUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleAddMember = async (userId) => {
    setLoading(true);
    setError('');
    try {
      await projectService.addMember(project.id, userId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    setLoading(true);
    setError('');
    try {
      await projectService.removeMember(project.id, userId);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const memberIds = project.members.map(m => m.id);
  const nonMembers = availableUsers.filter(u => !memberIds.includes(u.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Project Members</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="members-section">
          <h3>Current Members ({project.members.length})</h3>
          <div className="members-list">
            {project.members.length === 0 ? (
              <p className="empty-text">No members yet</p>
            ) : (
              project.members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <strong>{member.first_name} {member.last_name}</strong>
                    <span className="member-role">@{member.username} • {member.role}</span>
                  </div>
                  {member.id !== project.created_by?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={loading}
                      className="remove-button"
                      title="Remove member"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                  {member.id === project.created_by?.id && (
                    <span className="creator-badge">Creator</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="members-section">
          <h3>Available Users ({nonMembers.length})</h3>
          <div className="members-list">
            {nonMembers.length === 0 ? (
              <p className="empty-text">All users are already members</p>
            ) : (
              nonMembers.map((user) => (
                <div key={user.id} className="member-item">
                  <div className="member-info">
                    <strong>{user.first_name} {user.last_name}</strong>
                    <span className="member-role">@{user.username} • {user.role}</span>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id)}
                    disabled={loading}
                    className="add-button"
                    title="Add member"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="submit-button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;