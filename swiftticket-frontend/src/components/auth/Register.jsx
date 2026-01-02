import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'developer',
    expertise_areas: [],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleExpertiseChange = (e) => {
    const area = e.target.value;
    if (e.target.checked) {
      setFormData({
        ...formData,
        expertise_areas: [...formData.expertise_areas, area]
      });
    } else {
      setFormData({
        ...formData,
        expertise_areas: formData.expertise_areas.filter(a => a !== area)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Developer expertise validation
    if (formData.role === 'developer' && formData.expertise_areas.length === 0) {
      setError('Please select at least one area of expertise');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);

      // Handle different error formats
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          // Display first error message
          const firstError = Object.values(errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError(errors.toString());
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        <p className="register-subtitle">Join Jira Lite</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Expertise Areas - Only show for developers */}
          {formData.role === 'developer' && (
            <div className="form-group">
              <label>Areas of Expertise *</label>
              <div className="expertise-checkboxes">
                {['frontend', 'backend', 'api', 'database', 'mobile', 'devops'].map(area => (
                  <label key={area} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={area}
                      checked={formData.expertise_areas.includes(area)}
                      onChange={handleExpertiseChange}
                    />
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </label>
                ))}
              </div>
              {formData.expertise_areas.length === 0 && (
                <small className="field-hint">Please select at least one area of expertise</small>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;