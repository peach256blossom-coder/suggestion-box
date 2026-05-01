import React, { useState } from 'react';
import '../styles/Features.css';

const Features = () => {
  const [expandedFeature, setExpandedFeature] = useState(null);

  const features = [
    {
      id: 1,
      title: '📝 Public Suggestions',
      shortDesc: 'Share ideas visible to the entire campus community',
      fullDesc: `Submit suggestions that are visible to all campus members. These public suggestions help shape policies 
      and improvements that benefit everyone. Track upvotes and see community engagement in real-time.`,
      details: ['Community visibility', 'Real-time voting system', 'Response from administration', 'Discussion threads'],
    },
    {
      id: 2,
      title: '🔐 Private Suggestions',
      shortDesc: 'Direct messaging to specific departments',
      fullDesc: `Send confidential suggestions directly to relevant departments. Choose your target faculty 
      and your message reaches only the department head. Maintain complete anonymity.`,
      details: ['Department-specific routing', 'Full anonymity maintained', 'Direct department access', 'Priority response time'],
    },
    {
      id: 3,
      title: '🔔 Real-time Notifications',
      shortDesc: 'Instant updates on your suggestions',
      fullDesc: `Never miss updates about your suggestions. Receive instant notifications when 
      departments respond to your feedback or when your suggestion status changes.`,
      details: ['Email notifications', 'In-app alerts', 'Real-time updates', 'Notification history'],
    },
    {
      id: 4,
      title: '📊 Dashboard & Tracking',
      shortDesc: 'Monitor all your submissions and responses',
      fullDesc: `Access your personal dashboard to track all submissions, responses, and status updates. 
      See the impact of your suggestions and follow the progress.`,
      details: ['Submission history', 'Status tracking', 'Response management', 'Analytics dashboard'],
    },
  ];

  return (
    <div className="features">
      <div className="features-header">
        <h1>Platform Features</h1>
        <p>Discover everything our suggestion box platform offers</p>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-pad">
            <div
              className="feature-card"
              onClick={() =>
                setExpandedFeature(expandedFeature === feature.id ? null : feature.id)
              }
            >
              <h3>{feature.title}</h3>
              <p className="short-desc">{feature.shortDesc}</p>
              <div className="expand-icon">
                {expandedFeature === feature.id ? '▼' : '▶'}
              </div>
            </div>

            {expandedFeature === feature.id && (
              <div className="feature-expanded">
                <div className="expanded-content">
                  <p className="full-desc">{feature.fullDesc}</p>
                  <div className="feature-details">
                    <h4>Key Benefits:</h4>
                    <ul>
                      {feature.details.map((detail, index) => (
                        <li key={index}>✓ {detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
