import React, { useState } from 'react';
import whatsappIcon from '../Assets/wp.png';
import '../styles/ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // 'whatsapp', 'sms', 'chat'

  const handleWhatsApp = () => {
    const phoneNumber = '+256700000000'; // Change to your UMU contact
    const message = encodeURIComponent('Hello, I need help with UMU Suggestions Box');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleSMS = () => {
    const phoneNumber = '+256700000000'; // Change to your UMU contact
    const message = 'Hello, I need help with UMU Suggestions Box';
    window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
  };

  const handleEmail = () => {
    window.location.href = 'mailto:support@umu.ac.ug?subject=UMU Suggestions Box Support&body=Hello, I need help...';
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chat-widget-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with us"
      >
        <span className="chat-icon">💬</span>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <h3>Chat with Us</h3>
            <button
              className="chat-close"
              onClick={() => {
                setIsOpen(false);
                setActiveChat(null);
              }}
            >
              ✕
            </button>
          </div>

          {!activeChat ? (
            <div className="chat-options">
              <button
                className="chat-option whatsapp"
                onClick={() => {
                  handleWhatsApp();
                  setIsOpen(false);
                }}
              >
                <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-widget-icon" />
                <div>
                  <strong>WhatsApp</strong>
                  <p>Chat with us on WhatsApp</p>
                </div>
              </button>

              <button
                className="chat-option sms"
                onClick={() => {
                  handleSMS();
                  setIsOpen(false);
                }}
              >
                <span className="option-icon">📱</span>
                <div>
                  <strong>SMS</strong>
                  <p>Send us an SMS</p>
                </div>
              </button>

              <button
                className="chat-option email"
                onClick={() => {
                  handleEmail();
                  setIsOpen(false);
                }}
              >
                <span className="option-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>Email our support team</p>
                </div>
              </button>

              <button
                className="chat-option phone"
                onClick={() => {
                  window.location.href = 'tel:+256-791-042-302';
                  setIsOpen(false);
                }}
              >
                <span className="option-icon">📞</span>
                <div>
                  <strong>Call Us</strong>
                  <p>+256 791 042 302</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="chat-content">
              <button
                className="back-btn"
                onClick={() => setActiveChat(null)}
              >
                ← Back
              </button>
              <p>Redirecting...</p>
            </div>
          )}

          <div className="chat-footer">
            <small>Available 24/7</small>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;