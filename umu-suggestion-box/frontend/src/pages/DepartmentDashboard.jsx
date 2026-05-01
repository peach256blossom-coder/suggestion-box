import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import { suggestionsAPI, adminAPI } from '../utils/api';
import '../styles/DepartmentDashboard.css';

const DepartmentDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filter, setFilter] = useState('pending');
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    // Check if user is department head
    if (user?.role !== 'department_head') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get department from user
      const deptRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const userData = await deptRes.json();
      setDepartment(userData.department);

      // Fetch department suggestions
      if (userData.department) {
        const suggestionsRes = await suggestionsAPI.getDepartmentSuggestions(userData.department);
        setSuggestions(suggestionsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (suggestionId, status) => {
    if (!responseMessage.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      await adminAPI.updateSuggestionStatus(suggestionId, {
        status,
        response: responseMessage,
      });
      setResponseMessage('');
      setSelectedSuggestion(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    }
  };

  const filteredSuggestions = suggestions.filter(
    sugg => filter === 'all' || sugg.status === filter
  );

  if (!user || user.role !== 'department_head') {
    return (
      <div className="unauthorized">
        <div className="unauthorized-box">
          <h2>🔒 Access Denied</h2>
          <p>Only department heads can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="department-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <img 
            src="https://via.placeholder.com/60?text=UMU" 
            alt="UMU Logo" 
            className="header-logo"
          />
          <div className="header-text">
            <h1>Department Head Dashboard</h1>
            <p>Manage private suggestions from students, staff, and guests</p>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Filter by Status</h3>
            <div className="filter-options">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Suggestions ({suggestions.length})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({suggestions.filter(s => s.status === 'pending').length})
              </button>
              <button
                className={`filter-btn ${filter === 'under_review' ? 'active' : ''}`}
                onClick={() => setFilter('under_review')}
              >
                Under Review ({suggestions.filter(s => s.status === 'under_review').length})
              </button>
              <button
                className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                onClick={() => setFilter('resolved')}
              >
                Resolved ({suggestions.filter(s => s.status === 'resolved').length})
              </button>
              <button
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Rejected ({suggestions.filter(s => s.status === 'rejected').length})
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Stats</h3>
            <div className="stats-box">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">{suggestions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">New</span>
                <span className="stat-value pending">{suggestions.filter(s => s.status === 'pending').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Resolved</span>
                <span className="stat-value resolved">{suggestions.filter(s => s.status === 'resolved').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading suggestions...</p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No suggestions yet</h3>
              <p>There are no {filter !== 'all' ? filter : ''} suggestions for your department</p>
            </div>
          ) : (
            <div className="suggestions-grid">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion._id} className="suggestion-card">
                  <div className="card-header">
                    <h3>{suggestion.title}</h3>
                    <span className={`status-badge ${suggestion.status}`}>
                      {suggestion.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="card-meta">
                    <span className="category-tag">{suggestion.category}</span>
                    <span className="date">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="card-description">{suggestion.description}</p>

                  {suggestion.adminResponse && (
                    <div className="response-box">
                      <strong>Your Response:</strong>
                      <p>{suggestion.adminResponse}</p>
                      <small>Responded on {new Date(suggestion.respondedAt).toLocaleDateString()}</small>
                    </div>
                  )}

                  <div className="card-actions">
                    <button
                      className="btn-view"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      View & Respond
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedSuggestion && (
        <div className="modal-overlay" onClick={() => setSelectedSuggestion(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respond to Suggestion</h2>
              <button className="close-btn" onClick={() => setSelectedSuggestion(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="suggestion-details">
                <h3>{selectedSuggestion.title}</h3>
                <p className="description">{selectedSuggestion.description}</p>
                <div className="meta">
                  <span className="badge">{selectedSuggestion.category}</span>
                  <span className="date">
                    {new Date(selectedSuggestion.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="response-form">
                <label>Your Response *</label>
                <textarea
                  placeholder="Type your response to this suggestion..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="5"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-action under-review"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'under_review')
                  }
                >
                  📋 Mark Under Review
                </button>
                <button
                  className="btn-action resolved"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'resolved')
                  }
                >
                  ✓ Mark Resolved
                </button>
                <button
                  className="btn-action rejected"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'rejected')
                  }
                >
                  ✕ Mark Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard;