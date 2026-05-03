import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setToken, setUser } from '../utils/auth';
import { validateUMUEmail, getEmailErrorMessage, validatePassword } from '../utils/validation';
import '../styles/AuthModal.css';

const AuthModal = ({ isOpen, onClose, type = 'login' }) => {
  const navigate = useNavigate();
  const [authType, setAuthType] = useState(type);
  const [loginType, setLoginType] = useState('student'); // 'student' or 'dean'
  const [registerType, setRegisterType] = useState('student'); // 'student'
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    fullName: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (authType !== 'login') {
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

    } else {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
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

      if (authType === 'login') {
        if (loginType === 'dean') {
          response = await authAPI.deanLogin({
            email: formData.email,
            password: formData.password
          });
        } else {
          response = await authAPI.login({
            email: formData.email,
            password: formData.password
          });
        }
      } else {
        // Student/Staff Registration
        response = await authAPI.register({
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      }

      setToken(response.data.token);
      const user = response.data.user;
      setUser(user);

      onClose();

      // Redirect based on role
      if (authType === 'login') {
        if (loginType === 'dean') {
          navigate('/dean-dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      department: 'BAM',
      fullName: ''
    });
    setErrors({});
    setServerError('');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        {/* Main Tab Navigation */}
        <div className="auth-main-tabs">
          <button
            className={`auth-main-tab ${authType === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthType('login');
              resetForm();
            }}
          >
            Login
          </button>
          <button
            className={`auth-main-tab ${authType === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthType('register');
              resetForm();
            }}
          >
            Register
          </button>
        </div>

        {/* Register Sub-Tabs */}
        {authType === 'register' && (
          <div className="auth-sub-tabs">
            <button
              className={`auth-sub-tab ${registerType === 'student' ? 'active' : ''}`}
              onClick={() => {
                setRegisterType('student');
                resetForm();
              }}
            >
              👤 Student/Staff
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="auth-modal-content">
          {authType === 'login' && (
            <div className="auth-login-tabs">
              <button
                className={`auth-login-tab ${loginType === 'student' ? 'active' : ''}`}
                onClick={() => setLoginType('student')}
              >
                👤 Student/Staff
              </button>
              <button
                className={`auth-login-tab ${loginType === 'dean' ? 'active' : ''}`}
                onClick={() => setLoginType('dean')}
              >
                👑 Dean
              </button>
            </div>
          )}

          <h2>
            {authType === 'login' && (loginType === 'dean' ? 'Dean Login' : 'Login to UMU Suggestions Box')}
            {authType === 'register' && registerType === 'student' && 'Register as Student/Staff'}
            </h2>

          {serverError && (
            <div className="error-message">
              <span>⚠️</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label>{authType === 'login' ? (loginType === 'dean' ? 'Dean Email Address *' : 'UMU Campus Email *') : 'UMU Email *'}</label>
              <div className="input-wrapper">
                <input
                  type={showEmail ? 'text' : 'email'}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={authType === 'login' ? (loginType === 'dean' ? 'dean@stud.umu.ac.ug' : 'yourname@stud.umu.ac.ug') : 'yourname@stud.umu.ac.ug'}
                  className={errors.email ? 'input-error' : ''}
                />
                {formData.email && !showEmail && (
                  <span className={`validation-icon ${validateUMUEmail(formData.email) ? 'valid' : 'invalid'}`}>
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
                    {showEmail ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Full Name (Dean only) */}

            {/* Role Selection (Student/Staff Register) */}
            {authType === 'register' && registerType === 'student' && (
              <div className="form-group">
                <label>Your Role *</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="staff">Staff Member</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            )}

            {/* Department Selection (Department Head) */}

            {/* Password */}
            <div className="form-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={errors.password ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password (Register only) */}
            {authType === 'register' && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? 'input-error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? 'Processing...' : authType === 'login' ? (loginType === 'dean' ? '👑 Login as Dean' : 'Login') : 'Create Account'}
            </button>
          </form>

          {/* Info Box */}
          {authType === 'register' && (
            <div className="auth-info-box">
              {registerType === 'student' && (
                <p>✓ Your real identity is only used for verification<br/>
                   ✓ All your suggestions will be completely anonymous<br/>
                   ✓ Other members will never see your email address</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;