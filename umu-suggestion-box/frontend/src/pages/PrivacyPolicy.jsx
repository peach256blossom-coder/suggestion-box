import React from 'react';
import '../styles/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <header className="privacy-header">
        <h1>Privacy Policy</h1>
        <p>
          Uganda Martyrs University Suggestions Box respects your privacy and is committed to
          protecting your personal information.
        </p>
      </header>

      <section>
        <h2>Information We Collect</h2>
        <p>
          We collect only the minimum information needed for authentication and service delivery.
          This includes your UMU email address, password (securely stored), and any suggestion data
          you choose to submit.
        </p>
      </section>

      <section>
        <h2>How We Use Your Data</h2>
        <p>
          Your information is used to verify your membership, allow you to submit suggestions,
          and provide access to relevant dashboard features. Suggestions are stored anonymously
          for public display unless you choose to send a private suggestion.
        </p>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We implement reasonable measures to protect your data. However, no system is
          100% secure. Please keep your password private and do not share it with others.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          You can request to view or delete your account information by contacting our support
          team. You may also withdraw cookie consent at any time by clearing your browser cookies.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you have questions about this policy, please reach out at{' '}
          <a href="mailto:suggestions@umu.ac.com">suggestions@umu.ac.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;