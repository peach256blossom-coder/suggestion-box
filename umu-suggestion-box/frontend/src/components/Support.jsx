import React, { useState } from 'react';
import whatsappIcon from '../Assets/wp.png';
import '../styles/Support.css';

const supportWhatsappUrl = 'https://wa.me/256123456789?text=Hello%20UMU%20Support,%20I%20need%20help.';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const supportCategories = [
    {
      id: 1,
      title: '❓ FAQ',
      description: 'Frequently asked questions',
      items: [
        'How do I submit a suggestion?',
        'Will my identity be revealed?',
        'How long does it take to get a response?',
      ],
    },
    {
      id: 2,
      title: '📧 Contact Us',
      description: 'Reach out to our support team',
      items: [
        'Email: support@umusuggestionsbox.com',
        'Office: Student Center, Campus',
      ],
      whatsapp: {
        number: '+256 706930650',
        label: 'Message us on WhatsApp',
        url: supportWhatsappUrl,
      },
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({
      name: '',
      email: '',
      category: 'general',
      message: '',
    });
  };

  return (
    <div className="support">
      <div className="support-header">
        <h1>Support Center</h1>
        <p>We're here to help. Find answers or reach out to our team.</p>
      </div>

      <div className="support-content">
        <div className="support-categories">
          {supportCategories.map((category) => (
            <div key={category.id} className="support-card">
              <h2>{category.title}</h2>
              <p>{category.description}</p>
              <div className="support-items">
                {category.items.map((item, index) => (
                  <div key={index} className="support-item">
                    <span className="item-icon">→</span>
                    <span>{item}</span>
                  </div>
                ))}
                {category.whatsapp && (
                  <a
                    href={category.whatsapp.url}
                    className="whatsapp-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-icon" />
                    <div>
                      <strong>{category.whatsapp.label}</strong>
                      <span>{category.whatsapp.number}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="support-form-container">
          <div className="support-form">
            <h2>Contact Support</h2>
            {submitted ? (
              <div className="success-message">
                ✓ Thank you! Your message has been seen.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Your message..."
                    rows="5"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
