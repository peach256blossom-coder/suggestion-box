import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-watermark">
        <img 
          src="https://via.placeholder.com/150?text=UMU+Badge" 
          alt="UMU Badge" 
          className="badge-image"
        />
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <h3>About UMU Suggestions</h3>
          <p>
            A modern platform for students, staff, and guests to voice their ideas
            about campus life at Uganda Martyrs University, Nkozi Campus.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/public-suggestions">Public Suggestions</a></li>
            <li><a href="/features">Features</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li>Email: support@umusuggestionsbox.com</li>
            <li>Phone: +256-791-0423-02</li>
            <li>Location: Nkozi Campus</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 UMU Suggestions Box. Making a Difference.</p>
      </div>
    </footer>
  );
};

export default Footer;
