import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWebSocket } from './WebSocketContext';
import './AuthPage.css';

function AuthPage({ setLoading, setLoadingText, currentUser, setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { socket, isReady, send, setMessageHandler } = useWebSocket("auth");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const lastUsernameRef = useRef('');

// Handle incoming WebSocket messages
  useEffect(() => {
    setMessageHandler((event) => {
      setLoading(false);

      if (!event.data || event.data === '""') {
        return;
      }

      let response;
      try {
        response = JSON.parse(event.data);
      } catch (err) {
        setMessage("ERROR: Invalid JSON from server");
        return;
      }

      if (response?.status && response?.message) {
        const { status, message: msg } = response;
        setMessage(`${status.toUpperCase()}: ${msg}`);

        if (status === 'success') {
          const userId = response.userId;
          if (userId) {
            localStorage.setItem("userId", userId);
          }

          localStorage.setItem("username", lastUsernameRef.current);
          setCurrentUser(lastUsernameRef.current);
          setLoading(true);

          setTimeout(() => {
            setLoading(false);
            navigate('/sessions');
          }, 2000);
        }
      } else if (response?.type === "connected" && response?.message) {
      }
    });
  }, [setMessageHandler, setLoading, setCurrentUser, navigate]);

  // Validate user input
  const validateInput = () => {
    if (!username || !password) {
      setMessage('❗ Please fill in both username and password.');
      return false;
    }
    if (username.length < 3) {
      setMessage('❗ Username must be at least 3 characters.');
      return false;
    }
    if (password.length < 4) {
      setMessage('❗ Password must be at least 4 characters.');
      return false;
    }
    return true;
  };

// Handle login/signup
  const handleAuthAction = (action) => {
    if (!validateInput()) return;

    if (!socket || !isReady) {
      setMessage('❗ WebSocket is not ready.');
      return;
    }

    setLoadingText(action === 'login' ? 'Logging in...' : 'Signing up...');
    setLoading(true);

    lastUsernameRef.current = username;

    const payload = { action, username, password };

    if (username.trim() && password.trim()) {
      send(payload);
    }
  };


  return (
    <div className="auth-background">

      <div className="auth-container">
        <h2>Explore with EchoCalm</h2>
        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />

        <div className="passsword-wrapper">
        {/* Password Input */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        {/* Password Visibility Toggle */}
        <button 
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "Hide" : "Show"}
        </button>
        </div>
          <div className='tc'>
            By continuing, you agree to the <Link to="/terms" style={{color:"#B9DEF0", marginLeft:"5px"}}> Terms & Conditions</Link>.
          </div>
      
        <div className="auth-button-container">
          <button onClick={() => handleAuthAction('signup')} className="auth-button">Sign Up</button>
          <button onClick={() => handleAuthAction('login')} className="auth-button">Log In</button>
        </div>
        {message && <div className="auth-message">{message}</div>}
      </div>
    </div>
  );
}

export default AuthPage;
