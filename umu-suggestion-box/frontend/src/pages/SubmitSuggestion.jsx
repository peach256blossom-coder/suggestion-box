import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { suggestionsAPI } from '../utils/api';
import '../styles/SubmitSuggestion.css';

const SubmitSuggestion = () => {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lecturing',
    department: location.state?.department || '',
    isPrivate: true
  });
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const departments = ['BAM', 'SASS', 'SCIENCE', 'AGRIC', 'FOBE', 'EDUC', 'LAW'];
  const categories = ['Lecturing', 'Welfare', 'Meals', 'Sports', 'Hostels', 'ICT', 'Security', 'Library', 'Faculties', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear specific field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a suggestion title';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a detailed description';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    // Department validation (for private suggestions)
    if (formData.isPrivate && !formData.department) {
      newErrors.department = 'Please select a department for private suggestions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setServerError('');
    setFieldErrors({});

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        department: formData.isPrivate ? formData.department : null,
        isPrivate: formData.isPrivate,
        isPublic: !formData.isPrivate
      };

      console.log('Submitting payload:', payload);

      await suggestionsAPI.submitSuggestion(payload);

      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Lecturing',
        department: '',
        isPrivate: true
      });

      // Show success message for 2 seconds, then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      
      // Handle different error types
      if (err.response?.status === 400) {
        setServerError(err.response?.data?.message || 'Invalid suggestion data. Please check all fields.');
      } else if (err.response?.status === 401) {
        setServerError('Your session has expired. Please login again.');
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.status === 403) {
        setServerError('You do not have permission to submit suggestions.');
      } else {
        setServerError(
          err.response?.data?.message || 
          'Failed to submit suggestion. Please try again or contact support.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-container">
      {/* Success Message */}
      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>Suggestion Submitted Successfully!</h2>
            <p>Thank you for your anonymous feedback. We appreciate your input!</p>
            <p className="small-text">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      <div className="submit-box">
        <h1>Submit Your Suggestion</h1>
        <p className="subtitle">Help us improve campus life at UMU Nkozi</p>

        {/* User Identity Box */}
        <div className="user-identity">
          <p>
            <span className="identity-icon">✉️</span>
            Verified as: <strong>{user?.email || 'User'}</strong>
          </p>
          <p className="anonymity-note">
            <span className="lock-icon">🔒</span>
            Your suggestion will be completely anonymous
          </p>
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error:</strong>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title">
              Suggestion Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of your suggestion"
              maxLength="100"
              className={fieldErrors.title ? 'input-error' : ''}
              disabled={loading}
            />
            <div className="field-meta">
              <span className="char-count">
                {formData.title.length}/100
              </span>
              {fieldErrors.title && (
                <span className="field-error">{fieldErrors.title}</span>
              )}
            </div>
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={fieldErrors.category ? 'input-error' : ''}
              disabled={loading}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {fieldErrors.category && (
              <span className="field-error">{fieldErrors.category}</span>
            )}
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed explanation of your suggestion... (minimum 20 characters)"
              rows="6"
              maxLength="2000"
              className={fieldErrors.description ? 'input-error' : ''}
              disabled={loading}
            />
            <div className="field-meta">
              <span className="char-count">
                {formData.description.length}/2000
              </span>
              {fieldErrors.description && (
                <span className="field-error">{fieldErrors.description}</span>
              )}
            </div>
          </div>

          {/* Private/Public Toggle */}
          <div className="form-group checkbox-group">
            <label htmlFor="isPrivate">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Send as Private Suggestion (directly to department)</span>
            </label>
            <small>Private suggestions only go to the selected department. Public suggestions are visible to all members.</small>
          </div>

          {/* Department Selection */}
          {formData.isPrivate && (
            <div className="form-group">
              <label htmlFor="department">
                Select Department <span className="required">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={fieldErrors.department ? 'input-error' : ''}
                disabled={loading}
              >
                <option value="">Choose a department...</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {fieldErrors.department && (
                <span className="field-error">{fieldErrors.department}</span>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="info-box">
            <strong>ℹ️ How it works:</strong>
            <p>
              {formData.isPrivate
                ? `✓ Your suggestion will be sent directly and privately to the ${formData.department || 'selected'} department.\n✓ Only that department will see your feedback.\n✓ They will respond within 24-48 hours.`
                : '✓ Your suggestion will be visible to all authenticated UMU members.\n✓ Everyone will see it as completely anonymous.\n✓ Helps shape better campus policies.'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting Anonymously...
                </>
              ) : (
                '✍️ Submit Anonymously'
              )}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitSuggestion;