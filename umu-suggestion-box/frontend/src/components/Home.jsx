import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const departments = [
    {
      code: 'BAM',
      description: 'Business & Management focuses on entrepreneurship, finance, and administrative support.'
    },
    {
      code: 'SASS',
      description: 'Social Sciences & Strategic Studies supports student life, policy, and community programs.'
    },
    {
      code: 'SCIENCE',
      description: 'Science provides solutions for labs, research facilities, and academic resources.'
    },
    {
      code: 'AGRIC',
      description: 'Agriculture centers on farming systems, campus grounds, and food production ideas.'
    },
    {
      code: 'FOBE',
      description: 'Faculty of Built Environment supports campus design, construction, facilities, and built environment planning.'
    },
    {
      code: 'EDUC',
      description: 'Education focuses on training, learning environments, and teaching practice feedback.'
    },
    {
      code: 'LAW',
      description: 'Law supports student rights, campus governance, and legal awareness initiatives.'
    }
  ];

  const handleDepartmentClick = (dept) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate('/submit-suggestion', { state: { department: dept.code } });
  };

  const categoryCards = [
    {
      icon: '📚',
      title: 'Lecturing',
      description: 'Share ideas to improve teaching quality, lecture pacing, and classroom support.'
    },
    {
      icon: '❤️',
      title: 'Welfare',
      description: 'Raise issues around student wellbeing, counseling, safety, and campus life support.'
    },
    {
      icon: '🍽️',
      title: 'Meals',
      description: 'Suggest improvements for food quality, menu variety, dining hours, and hygiene.'
    },
    {
      icon: '⚽',
      title: 'Sports',
      description: 'Recommend better sports facilities, training schedules, and recreational programs.'
    },
    {
      icon: '🏠',
      title: 'Hostels',
      description: 'Report hostel living concerns, maintenance needs, or ideas for better residential services.'
    },
    {
      icon: '💻',
      title: 'ICT',
      description: 'Suggest improvements for internet access, lab resources, software, and tech support.'
    },
    {
      icon: '👮',
      title: 'Security',
      description: 'Share feedback on campus safety, lighting, patrols, and secure access measures.'
    },
    {
      icon: '📖',
      title: 'Library',
      description: 'Recommend library hours, resource availability, study spaces, and book collections.'
    }
  ];

  return (
    <div className="home">
      <div className="home-watermark">
        <img 
          src="https://via.placeholder.com/300?text=UMU+Nkozi+Campus" 
          alt="Campus" 
          className="watermark-image"
        />
      </div>

      <div className="home-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Hey! Let's Talk 🗣️</h1>
          <p className="hero-subtitle">
            Your voice matters. Share your ideas, suggestions, and feedback about our campus life.
            All submissions are completely anonymous.
          </p>

          <div className="hero-buttons">
            {isAuthenticated() ? (
              <>
                <Link to="/public-suggestions" className="btn btn-primary">
                  View Public Suggestions
                </Link>
                <Link to="/submit-suggestion" className="btn btn-secondary">
                  ✍️ Submit Your Idea
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-primary"
                >
                  Login to View Suggestions
                </Link>
                <Link
                  to="/register"
                  className="btn btn-secondary"
                >
                  Register as Member
                </Link>
              </>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="intro-section">
          <h2>About This Platform</h2>
          <div className="intro-grid">
            <div className="intro-card">
              <div className="card-icon">🎯</div>
              <h3>Your Voice Matters</h3>
              <p>
                We believe every student, staff member, and guest has valuable insights about 
                campus life. This platform ensures your suggestions reach the right people.
              </p>
            </div>

            <div className="intro-card">
              <div className="card-icon">🔒</div>
              <h3>100% Anonymous</h3>
              <p>
                All submissions are completely anonymous. Your real name is never shown.
                Only authenticated members can view and submit suggestions.
              </p>
            </div>

            <div className="intro-card">
              <div className="card-icon">⚡</div>
              <h3>Direct Action</h3>
              <p>
                Private suggestions go directly to relevant departments for immediate action. 
                Public suggestions help shape better campus policies.
              </p>
            </div>

            <div className="intro-card">
              <div className="card-icon">📢</div>
              <h3>Real Impact</h3>
              <p>
                See how your suggestions lead to actual changes. Track status updates and 
                receive notifications on progress.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Benefits Section */}
        <div className="membership-section">
          <h2>Why Become a Member?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">📖</span>
              <h3>Read All Suggestions</h3>
              <p>Access the complete community feedback database</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">✍️</span>
              <h3>Submit Anonymously</h3>
              <p>Share your ideas while staying completely anonymous</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🔔</span>
              <h3>Get Notifications</h3>
              <p>Receive updates when departments respond to your suggestions</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">👍</span>
              <h3>Support Ideas</h3>
              <p>Upvote suggestions you agree with</p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section">
          <h2>What Can You Suggest?</h2>
          <div className="categories-grid">
            {categoryCards.map((card) => (
              <div key={card.title} className="category-card">
                <div className="category-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Section */}
        <div className="departments-section">
          <h2>Our Faculties</h2>
          <div className="departments-grid">
            {departments.map((dept) => (
              <button
                key={dept.code}
                className="dept-card dept-card-large"
                onClick={() => handleDepartmentClick(dept)}
                title={`Click to submit a suggestion to ${dept.code}`}
              >
                <div className="dept-card-title">{dept.code}</div>
                <p className="dept-card-description">{dept.description}</p>
              </button>
            ))}
          </div>
          <p className="dept-hint">
            💡 Click any faculty to submit a suggestion directly to that department
          </p>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2>Ready to Share Your Ideas?</h2>
          <p>Join the UMU community and help us build a better campus</p>
          {!isAuthenticated() && (
            <Link 
              to="/register"
              className="btn btn-large"
            >
              Create Your Account Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;