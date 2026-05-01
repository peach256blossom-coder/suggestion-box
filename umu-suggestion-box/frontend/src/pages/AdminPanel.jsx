import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [suggestionsRes, statsRes] = await Promise.all([
        adminAPI.getAllSuggestions(),
        adminAPI.getDashboardStats(),
      ]);
      setSuggestions(suggestionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (suggestionId, status) => {
    try {
      await adminAPI.updateSuggestionStatus(suggestionId, {
        status,
        response: responseMessage,
      });
      setResponseMessage('');
      setSelectedSuggestion(null);
      fetchAdminData();
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage suggestions and campus feedback</p>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalSuggestions}</div>
            <div className="stat-label">Total Suggestions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingSuggestions}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.resolvedSuggestions}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="admin-content">
          <div className="suggestions-list">
            {suggestions.map((suggestion) => (
              <div key={suggestion._id} className="admin-suggestion">
                <div className="suggestion-info">
                  <h3>{suggestion.title}</h3>
                  <p>{suggestion.description}</p>
                  <div className="suggestion-details">
                    <span className="category">{suggestion.category}</span>
                    <span className={`status ${suggestion.status}`}>
                      {suggestion.status}
                    </span>
                  </div>
                </div>
                <button
                  className="view-btn"
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  View & Respond
                </button>
              </div>
            ))}
          </div>

          {selectedSuggestion && (
            <div className="modal-overlay" onClick={() => setSelectedSuggestion(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{selectedSuggestion.title}</h2>
                <p>{selectedSuggestion.description}</p>

                <div className="response-form">
                  <textarea
                    placeholder="Type your response..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  ></textarea>

                  <div className="response-buttons">
                    <button
                      className="btn-status under-review"
                      onClick={() =>
                        handleResponseSubmit(selectedSuggestion._id, 'under_review')
                      }
                    >
                      Mark Under Review
                    </button>
                    <button
                      className="btn-status resolved"
                      onClick={() =>
                        handleResponseSubmit(selectedSuggestion._id, 'resolved')
                      }
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>

                <button
                  className="close-btn"
                  onClick={() => setSelectedSuggestion(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
