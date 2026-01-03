import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { User, Mail, Briefcase, Edit2, Save, X } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user: authUser, login } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    expertise_areas: [],
  });

  const availableExpertise = [
    'frontend',
    'backend',
    'api',
    'database',
    'mobile',
    'devops',
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await userService.getCurrentUser();
      setUser(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        bio: data.profile?.bio || '',
        expertise_areas: data.profile?.expertise_areas || [],
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleExpertiseToggle = (expertise) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(expertise)
        ? prev.expertise_areas.filter(e => e !== expertise)
        : [...prev.expertise_areas, expertise]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update basic user info
      const userInfoData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };
      await userService.updateUserInfo(userInfoData);

      // Update profile (expertise and bio)
      const profileData = {
        bio: formData.bio,
        expertise_areas: formData.expertise_areas,
      };
      const updatedUser = await userService.updateProfile(profileData);

      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully!');

      // Update auth context
      login(updatedUser);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      bio: user.profile?.bio || '',
      expertise_areas: user.profile?.expertise_areas || [],
    });
    setEditMode(false);
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!editMode ? (
          <button className="edit-button" onClick={() => setEditMode(true)}>
            <Edit2 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-button" onClick={handleCancel}>
              <X size={18} /> Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Basic Information</h2>

          <div className="info-grid">
            <div className="info-item">
              <label>
                <User size={16} /> Username
              </label>
              <div className="info-value">{user.username}</div>
            </div>

            <div className="info-item">
              <label>
                <Briefcase size={16} /> Role
              </label>
              <div className="info-value role-badge">
                {user.role.replace('_', ' ')}
              </div>
            </div>

            <div className="info-item">
              <label>First Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              ) : (
                <div className="info-value">{user.first_name}</div>
              )}
            </div>

            <div className="info-item">
              <label>Last Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              ) : (
                <div className="info-value">{user.last_name}</div>
              )}
            </div>

            <div className="info-item full-width">
              <label>
                <Mail size={16} /> Email
              </label>
              {editMode ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              ) : (
                <div className="info-value">{user.email}</div>
              )}
            </div>
          </div>
        </div>

        {user.role === 'developer' && (
          <div className="profile-section">
            <h2>Expertise Areas</h2>
            {editMode ? (
              <div className="expertise-edit">
                <p className="helper-text">Select your areas of expertise:</p>
                <div className="expertise-checkboxes">
                  {availableExpertise.map(expertise => (
                    <label key={expertise} className="expertise-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.expertise_areas.includes(expertise)}
                        onChange={() => handleExpertiseToggle(expertise)}
                      />
                      <span>{expertise}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="expertise-badges">
                {user.profile?.expertise_areas?.length > 0 ? (
                  user.profile.expertise_areas.map(expertise => (
                    <span key={expertise} className="expertise-badge">
                      {expertise}
                    </span>
                  ))
                ) : (
                  <p className="empty-text">No expertise areas set</p>
                )}
              </div>
            )}

            <div className="workload-info">
              <label>Current Workload</label>
              <div className="workload-value">
                {user.profile?.current_workload || 0} active tickets
              </div>
            </div>
          </div>
        )}

        <div className="profile-section">
          <h2>Bio</h2>
          {editMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows="6"
              placeholder="Tell us about yourself..."
              className="bio-textarea"
            />
          ) : (
            <div className="bio-display">
              {user.profile?.bio || <span className="empty-text">No bio yet</span>}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Account Details</h2>
          <div className="account-meta">
            <div className="meta-item">
              <span className="meta-label">Member since:</span>
              <span className="meta-value">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;