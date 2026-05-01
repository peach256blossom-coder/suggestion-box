import React, { useState, useEffect } from 'react';
import { suggestionsAPI, notificationsAPI } from '../utils/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [mySuggestions, setMySuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [suggestionsRes, notificationsRes] = await Promise.all([
        suggestionsAPI.getUserSuggestions(),
        notificationsAPI.getNotifications(),
      ]);
      setMySuggestions(suggestionsRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Track your suggestions and responses</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          My Suggestions ({mySuggestions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 'suggestions' && (
            <div className="suggestions-section">
              {mySuggestions.length === 0 ? (
                <p className="empty-state">You haven't submitted any suggestions yet.</p>
              ) : (
                <div className="suggestions-list">
                  {mySuggestions.map((suggestion) => (
                    <div key={suggestion._id} className="suggestion-item">
                      <div className="suggestion-info">
                        <h3>{suggestion.title}</h3>
                        <p>{suggestion.description}</p>
                        <div className="suggestion-meta">
                          <span className="category">{suggestion.category}</span>
                          <span className={`status ${suggestion.status}`}>
                            {suggestion.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              {notifications.length === 0 ? (
                <p className="empty-state">No notifications yet.</p>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      <div className="notification-icon">
                        {notification.type === 'response' ? '💬' : '📢'}
                      </div>
                      <div className="notification-content">
                        <h4>{notification.message}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
