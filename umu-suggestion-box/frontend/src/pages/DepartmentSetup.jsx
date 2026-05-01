import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import { validateUMUEmail, getEmailErrorMessage, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const DepartmentSetup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    department: 'BAM',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = ['BAM', 'SASS', 'SCIENCE', 'AGRIC', 'FOBE', 'EDUC', 'LAW'];

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
    } else if (!validateUMUEmail(formData.email)) {
      newErrors.email = getEmailErrorMessage(formData.email);
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        role: 'department_head',
        department: formData.department,
      });
      setToken(response.data.token);
      setUser({ ...response.data.user, department: formData.department });
      navigate('/department-dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Department Head Registration</h2>
        <p className="auth-subtitle">Set up your account to manage department suggestions</p>

        {serverError && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label>UMU Campus Email *</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="yourname@stud.umu.ac.ug"
                className={errors.email ? 'input-error' : ''}
              />
              {formData.email && (
                <span className={`email-validation-icon ${validateUMUEmail(formData.email) ? 'valid' : 'invalid'}`}>
                  {validateUMUEmail(formData.email) ? '✓' : '✗'}
                </span>
              )}
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
            <small className="help-text">Only @stud.umu.ac.ug emails are allowed</small>
          </div>

          {/* Department Field */}
          <div className="form-group">
            <label>Department *</label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange}
              required
              className="form-select"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <small className="help-text">Select your department</small>
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
                placeholder="Enter password"
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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label>Confirm Password *</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <span title="Hide password">👁️</span>
                ) : (
                  <span title="Show password">👁️‍🗨️</span>
                )}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="privacy-notice">
            <p>✓ You'll have access to all private suggestions for your department<br/>
               ✓ You can respond to suggestions and track progress<br/>
               ✓ Submitters will be notified of your responses
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Setting up...
              </>
            ) : (
              'Create Department Head Account'
            )}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default DepartmentSetup;