import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import '../styles/Auth.css';

const DeanLogin = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    
    try {
      const response = await api.post('/auth/dean/login', {
        email: formData.email,
        password: formData.password
      });
      setToken(response.data.token);
      setUser({ ...response.data.user, role: 'dean_of_students' });
      navigate('/dean-dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="dean-header">
          <span className="dean-icon">👑</span>
          <h2>Dean of Students Login</h2>
        </div>
        <p className="auth-subtitle">Access the administrative dashboard</p>
        
        {serverError && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="dean@stud.umu.ac.ug"
                className={errors.email ? 'input-error' : ''}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password *</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <span title="Hide password">👁️</span>
                ) : (
                  <span title="Show password">👁️‍🗨️</span>
                )}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : (
              '👑 Login as Dean'
            )}
          </button>
        </form>

        <p className="auth-link">
          Not a Dean? <Link to="/login">Login as student/staff</Link>
        </p>
      </div>
    </div>
  );
};

export default DeanLogin;