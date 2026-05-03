import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import { validateUMUEmail, getEmailErrorMessage, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [loginType, setLoginType] = useState('student'); // 'student' or 'dean'
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (loginType !== 'dean' && !validateUMUEmail(formData.email)) {
      newErrors.email = getEmailErrorMessage(formData.email);
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
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
      let response;
      
      if (loginType === 'dean') {
        response = await authAPI.deanLogin(formData);
        setUser({ ...response.data.user, role: 'dean_of_students' });
        navigate('/dean-dashboard');
      } else {
        response = await authAPI.login(formData);
        setUser(response.data.user);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
      
      setToken(response.data.token);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🔓 Login</h2>
        <p className="auth-subtitle">Access your UMU Notice Board</p>
        
        {serverError && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Login Type Dropdown */}
          <div className="form-group">
            <label>Login as *</label>
            <select 
              name="loginType" 
              value={loginType} 
              onChange={(e) => setLoginType(e.target.value)}
              className="form-select"
            >
              <option value="student">Student/Faculty</option>
              <option value="dean">Dean of Students</option>
            </select>
          </div>
          
          {/* Email Field */}
          <div className="form-group">
            <label>{loginType === 'dean' ? 'Email Address' : 'UMU Campus Email'} *</label>
            <div className="input-wrapper">
              <input
                type={showEmail ? 'text' : 'email'}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={loginType === 'dean' ? 'dean@stud.umu.ac.ug' : 'yourname@stud.umu.ac.ug'}
                className={errors.email ? 'input-error' : ''}
              />
              {formData.email && loginType !== 'dean' && !showEmail && (
                <span className={`email-validation-icon ${validateUMUEmail(formData.email) ? 'valid' : 'invalid'}`}>
                  {validateUMUEmail(formData.email) ? '✓' : '✗'}
                </span>
              )}
              {formData.email && (
                <button
                  type="button"
                  className="email-toggle"
                  onClick={() => setShowEmail(!showEmail)}
                  tabIndex="-1"
                >
                  {showEmail ? (
                    <span title="Hide email">👁️</span>
                  ) : (
                    <span title="Show email">👁️‍🗨️</span>
                  )}
                </button>
              )}
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
            {loginType !== 'dean' && <small className="help-text">Only @stud.umu.ac.ug emails are allowed</small>}
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
            <small className="help-text">Minimum 6 characters</small>
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
              '✓ Login'
            )}
          </button>
        </form>

        <div className="auth-links-section">
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p className="auth-link">
            Need an admin account? <Link to="/register">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;