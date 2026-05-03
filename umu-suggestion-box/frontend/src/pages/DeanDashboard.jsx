import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import api from '../utils/api';
import '../styles/DeanDashboard.css';

const DeanDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [forwardToDept, setForwardToDept] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (user?.role !== 'dean_of_students') {
      navigate('/login');
      return;
    }
    fetchSuggestions();
  }, [navigate, user?.role]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dean/suggestions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuggestions(response.data?.suggestions || []);
      setStats(response.data?.stats || {
        total: 0,
        pending: 0,
        underReview: 0,
        resolved: 0,
        rejected: 0,
        public: 0,
        private: 0,
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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
      await api.put(
        `/dean/suggestions/${suggestionId}/respond`,
        {
          response: responseMessage,
          status,
          forwardToDepartment: forwardToDept,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setResponseMessage('');
      setForwardToDept(false);
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (error) {
      console.error('Dean response error:', error);
      alert(error.response?.data?.message || 'Failed to submit response');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      await api.delete(
        `/dean/suggestions/${deleteModal._id}/delete`,
        {
          data: {
            reason: deleteReason.trim(),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setDeleteModal(null);
      setDeleteReason('');
      alert('Suggestion deleted successfully. Notification sent to submitter.');
      fetchSuggestions();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete suggestion');
    }
  };

  const filteredSuggestions = filter === 'all'
    ? suggestions
    : (suggestions || []).filter(s => s.status === filter);

  return (
    <div className="dean-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏛️ Dean of Students Dashboard</h1>
          <p>Oversee all campus suggestions and departmental responses</p>
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
                All ({suggestions.length})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({stats?.pending || 0})
              </button>
              <button
                className={`filter-btn ${filter === 'under_review' ? 'active' : ''}`}
                onClick={() => setFilter('under_review')}
              >
                Under Review ({stats?.underReview || 0})
              </button>
              <button
                className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                onClick={() => setFilter('resolved')}
              >
                Resolved ({stats?.resolved || 0})
              </button>
              <button
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Rejected ({stats?.rejected || 0})
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Overview Stats</h3>
            {stats && (
              <div className="stats-overview">
                <div className="stat">
                  <span className="label">Total</span>
                  <span className="value">{stats.total}</span>
                </div>
                <div className="stat">
                  <span className="label">Public</span>
                  <span className="value">{stats.public}</span>
                </div>
                <div className="stat">
                  <span className="label">Private</span>
                  <span className="value">{stats.private}</span>
                </div>
              </div>
            )}
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
              <p>No suggestions in this category</p>
            </div>
          ) : (
            <div className="suggestions-list">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion._id} className="suggestion-item">
                  <div className="item-header">
                    <div>
                      <h3>{suggestion.title}</h3>
                      <div className="item-meta">
                        <span className="category">{suggestion.category}</span>
                        <span className={`status ${suggestion.status}`}>
                          {suggestion.status}
                        </span>
                        <span className="type">
                          {suggestion.isPrivate ? '🔒 Private' : '📢 Public'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="description">{suggestion.description}</p>
                  {suggestion.adminResponse && (
                    <div className="response-box">
                      <strong>Response:</strong>
                      <p>{suggestion.adminResponse}</p>
                    </div>
                  )}
                  <div className="item-actions">
                    <button
                      className="btn-respond"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      View & Respond
                    </button>
                    {suggestion.status === 'resolved' && (
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteModal(suggestion)}
                        title="Delete resolved suggestion and notify submitter"
                      >
                        🗑️ Delete & Notify Sender
                      </button>
                    )}
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
              <h2>Dean's Response</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedSuggestion(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="suggestion-preview">
                <h3>{selectedSuggestion.title}</h3>
                <p>{selectedSuggestion.description}</p>
                <div className="preview-meta">
                  <span>{selectedSuggestion.category}</span>
                  <span>
                    {selectedSuggestion.isPrivate ? '🔒 Private' : '📢 Public'}
                  </span>
                </div>
              </div>

              <div className="response-form">
                <label>Your Response as Dean *</label>
                <textarea
                  placeholder="Provide your response..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="5"
                />
              </div>

              <div className="forward-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={forwardToDept}
                    onChange={(e) => setForwardToDept(e.target.checked)}
                  />
                  Forward to Department for Action
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-action pending"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'pending')
                  }
                >
                  ⏳ Keep Pending
                </button>
                <button
                  className="btn-action review"
                  onClick={() =>
                    handleResponseSubmit(
                      selectedSuggestion._id,
                      'under_review'
                    )
                  }
                >
                  📋 Under Review
                </button>
                <button
                  className="btn-action resolved"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'resolved')
                  }
                >
                  ✓ Resolved
                </button>
                <button
                  className="btn-action rejected"
                  onClick={() =>
                    handleResponseSubmit(selectedSuggestion._id, 'rejected')
                  }
                >
                  ✕ Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Delete Suggestion</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setDeleteModal(null);
                  setDeleteReason('');
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="suggestion-preview">
                <h3>{deleteModal.title}</h3>
                <p className="delete-warning">
                  This suggestion will be permanently deleted and the anonymous submitter will be notified.
                </p>
              </div>

              <div className="delete-form">
                <label>Optional: Reason for Deletion</label>
                <textarea
                  placeholder="E.g., 'This has been resolved and implemented', 'Duplicate suggestion'..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows="3"
                />
                <small>This will be sent to the submitter to inform them why their suggestion was deleted.</small>
              </div>

              <div className="modal-actions delete-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setDeleteModal(null);
                    setDeleteReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete-confirm"
                  onClick={handleDelete}
                >
                  🗑️ Delete & Notify Sender
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeanDashboard;