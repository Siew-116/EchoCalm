import React from 'react';
import './HelpPage.css';
import { useNavigate } from 'react-router-dom';

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="help-page">
      <div className="help-container">
        <h2>Help & Support</h2>

        <section>
          <h3>❓ Frequently Asked Questions</h3>
          <p><strong>Q:</strong> How do I reset my username and password</p>
          <p><strong>A:</strong> Go to your profile and click the edit button next to your user credentials.</p>

          <p><strong>Q:</strong> Why can't I log in?</p>
          <p><strong>A:</strong> Double-check your credentials or sign up if you're new. If nothing work, feel free to reach out to us.</p>

          <p><strong>Q:</strong> How do I log out my account?</p>
          <p><strong>A:</strong> Go to your profile and click the Log out button.</p>
        </section>

        <section>
          <h3>💡 How to Use</h3>
          <p> Click "+ New Chat Session" button at homepage to start your chat with avatar. You can set avatar on your own preferences. After end session, you can track your session history at homepage by viewing report or deleting them.</p>
        </section>

        <section>
          <h3>📧 Contact Support</h3>
          <p>Need help? We're here for you. This demo version does not include live support.</p>
          <p>For inquiries, please imagine contacting us at <strong>help@notarealemail.com</strong></p>
        </section>

        <button className="back-btn" onClick={() => navigate('/sessions')}>
          Back Home
        </button>
      </div>
    </div>
  );
};

export default HelpPage;
