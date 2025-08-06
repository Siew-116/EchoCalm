import React from 'react';

const Loader = ({ text = "Loading..." }) => (
  <div style={styles.overlay}>
    <div style={styles.spinner}></div>
    <p style={styles.text}>{text}</p>
  </div>
);

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
  },
  spinner: {
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #3498db",
    borderRadius: "50%",
    width: 60, height: 60,
    animation: "spin 1s linear infinite"
  },
  text: {
    marginTop: "1rem",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.2rem"
  }
};

export default Loader;