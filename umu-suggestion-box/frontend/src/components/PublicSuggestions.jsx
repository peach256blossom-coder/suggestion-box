import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';
import { suggestionsAPI } from '../utils/api';
import '../styles/PublicSuggestions.css';

const PublicSuggestions = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchSuggestions();
  }, [navigate]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await suggestionsAPI.getPublicSuggestions();
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (suggestionId) => {
    try {
      await suggestionsAPI.upvoteSuggestion(suggestionId);
      fetchSuggestions();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesFilter = filter === 'all' || suggestion.category === filter;
    const matchesSearch =
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="public-suggestions">
      <div className="suggestions-header">
        <h1>Community Suggestions</h1>
        <p>See what your peers are suggesting for our campus</p>
        <div className="user-info-banner">
          <p>Logged in as: <strong>{user?.email}</strong></p>
        </div>
      </div>

      <div className="suggestions-filters">
        <input
          type="text"
          placeholder="Search suggestions..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'Lecturing' ? 'active' : ''}`}
            onClick={() => setFilter('Lecturing')}
          >
            Lecturing
          </button>
          <button
            className={`filter-btn ${filter === 'Welfare' ? 'active' : ''}`}
            onClick={() => setFilter('Welfare')}
          >
            Welfare
          </button>
          <button
            className={`filter-btn ${filter === 'Meals' ? 'active' : ''}`}
            onClick={() => setFilter('Meals')}
          >
            Meals
          </button>
          <button
            className={`filter-btn ${filter === 'Sports' ? 'active' : ''}`}
            onClick={() => setFilter('Sports')}
          >
            Sports
          </button>
          <button
            className={`filter-btn ${filter === 'Security' ? 'active' : ''}`}
            onClick={() => setFilter('Security')}
          >
            Security
          </button>
          <button
            className={`filter-btn ${filter === 'Library' ? 'active' : ''}`}
            onClick={() => setFilter('Library')}
          >
            Library
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading suggestions...</div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="no-suggestions">
          <p>📭 No public suggestions have been posted yet.</p>
          <p className="no-suggestions-subtitle">
            Login and submit your first suggestion to help improve campus life.
          </p>
          <div className="sample-suggestion-card">
            <div className="suggestion-header">
              <div>
                <h3>Improve Campus Lighting Near Libraries</h3>
                <span className="category-badge">Security</span>
                <span className="status-badge pending">pending</span>
              </div>
            </div>
            <p className="suggestion-description">
              Add more lighting and CCTV cameras around the library and student center so people feel safer during evening study sessions.
            </p>
            <div className="suggestion-footer">
              <div className="suggestion-stats">
                <span className="upvotes">👍 14 Upvotes</span>
                <span className="views">👁️ 72 Views</span>
                <span className="anonymous">🔒 Anonymous</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="suggestions-list">
          {filteredSuggestions.map((suggestion) => (
            <div key={suggestion._id} className="suggestion-card">
              <div className="suggestion-header">
                <div>
                  <h3>{suggestion.title}</h3>
                  <span className="category-badge">{suggestion.category}</span>
                  {suggestion.status && (
                    <span className={`status-badge ${suggestion.status}`}>
                      {suggestion.status}
                    </span>
                  )}
                </div>
              </div>

              <p className="suggestion-description">{suggestion.description}</p>

              {suggestion.adminResponse && (
                <div className="admin-response">
                  <strong>🏛️ Response from Administration:</strong>
                  <p>{suggestion.adminResponse}</p>
                </div>
              )}

              <div className="suggestion-footer">
                <div className="suggestion-stats">
                  <span className="upvotes">👍 {suggestion.upvotes} Upvotes</span>
                  <span className="views">👁️ {suggestion.views} Views</span>
                  <span className="anonymous">🔒 Anonymous</span>
                </div>
                <button
                  className="upvote-btn"
                  onClick={() => handleUpvote(suggestion._id)}
                >
                  👍 Upvote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicSuggestions;