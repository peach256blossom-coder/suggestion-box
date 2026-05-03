import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeToken, getUser } from '../utils/auth';
import umuLogo from '../Assets/umu-logo.png';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('user');
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src={umuLogo} 
            alt="UMU Logo" 
            className="navbar-logo-img"
          />
          <span className="navbar-title">Uganda Martyrs University - Nkozi Campus</span>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/public-suggestions" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Public Suggestions
          </Link>
          <Link to="/features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Features
          </Link>
          <Link to="/support" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Support
          </Link>
          <Link to="/privacy-policy" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Privacy Policy
          </Link>

          {isAuthenticated() ? (
            <>
              {user?.role === 'dean_of_students' ? (
                <>
                  <Link 
                    to="/dean-dashboard" 
                    className="nav-link dean-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👑 Dean Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/submit-suggestion" 
                    className="nav-link submit-btn"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ✍️ Submit Suggestion
                  </Link>
                  <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                </>
              )}
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                  ⚙️ Admin Panel
                </Link>
              )}
              
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="nav-auth-group">
                <Link 
                  to="/login"
                  className="nav-link login-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="nav-link register-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </>
          )}
        </div>

        <div
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;