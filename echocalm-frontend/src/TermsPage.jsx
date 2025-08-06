
import {useNavigate} from "react-router-dom";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Close / Back Button */}
      <button 
        onClick={() => navigate('/auth')}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          fontSize: "1.2rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#333"
        }}
        aria-label="Close Terms"
      >
        ✕
      </button>
      <h1 style={styles.heading}>Terms and Conditions</h1>
      <p style={styles.text}>
        Welcome to our app. By using our services, you agree to the following terms and conditions. 
        Please read them carefully.
      </p>

      <h2 style={styles.subheading}>1. Acceptance of Terms</h2>
      <p style={styles.text}>
        By accessing or using this application, you agree to be bound by these terms. 
        If you do not agree, please do not use the service.
      </p>

      <h2 style={styles.subheading}>2. User Conduct</h2>
      <p style={styles.text}>
        You agree not to misuse the app, attempt to gain unauthorized access, or interfere with its operations.
      </p>

      <h2 style={styles.subheading}>3. Data and Privacy</h2>
      <p style={styles.text}>
        We collect limited user data solely for functionality. Your information is not shared with third parties.
      </p>

      <h2 style={styles.subheading}>4. Limitation of Liability</h2>
      <p style={styles.text}>
        We are not liable for any damages resulting from use or inability to use the service.
      </p>

      <h2 style={styles.subheading}>5. Changes to Terms</h2>
      <p style={styles.text}>
        We may update these terms from time to time. Continued use constitutes acceptance of the new terms.
      </p>

      <p style={{ ...styles.text, marginTop: "2rem" }}>
        Last updated: July 30, 2025
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: 1.6,
    color: "#333",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  subheading: {
    fontSize: "1.2rem",
    marginTop: "1.5rem",
    fontWeight: "bold",
  },
  text: {
    fontSize: "1rem",
  },
};

export default TermsPage;
