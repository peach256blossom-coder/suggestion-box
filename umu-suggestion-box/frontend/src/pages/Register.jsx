import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import { validateUMUEmail, getEmailErrorMessage, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateUMUEmail(formData.email)) {
      newErrors.email = getEmailErrorMessage(formData.email);
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
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
        role: formData.role
      });
      setToken(response.data.token);
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password ? 
    formData.password.length >= 12 ? 'strong' : 
    formData.password.length >= 8 ? 'medium' : 
    formData.password.length >= 6 ? 'weak' : 'very-weak' 
    : '';

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join UMU community and share your suggestions anonymously</p>
        
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

          {/* Role Selection */}
          <div className="form-group">
            <label>Your Role *</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="form-select"
            >
              <option value="student">Student</option>
              <option value="staff">Staff Member</option>
              <option value="guest">Guest</option>
            </select>
            <small className="help-text">Select your role at UMU</small>
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
                placeholder="Create a strong password"
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength}`}></div>
                <small className={`strength-text strength-${passwordStrength}`}>
                  {passwordStrength === 'very-weak' && '⚠️ Very weak'}
                  {passwordStrength === 'weak' && '⚠️ Weak'}
                  {passwordStrength === 'medium' && '✓ Medium'}
                  {passwordStrength === 'strong' && '✓ Strong'}
                </small>
              </div>
            )}
            <small className="help-text">Minimum 6 characters (use uppercase, numbers for stronger password)</small>
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
                placeholder="Re-enter your password"
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
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <small className="success-text">✓ Passwords match</small>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <p>
              ✓ Your real identity is only used for verification<br/>
              ✓ All your suggestions will be completely anonymous<br/>
              ✓ Other members will never see your email address
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
                Creating Account...
              </>
            ) : (
              'Create My Account'
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

export default Register;