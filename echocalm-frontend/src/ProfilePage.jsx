import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './WebSocketContext';
import NavMenu from "./NavMenu";
import './ProfilePage.css';

function ProfilePage({ currentUser, setCurrentUser }) {
  const { socket } = useWebSocket("profile");
  const navigate = useNavigate();
  const [users, setUsers] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    username: currentUser,
    password: ''
  });

// Set current user profile
useEffect(() => {
  if (currentUser) {
    setFormData(prev => ({
      ...prev,
      username: currentUser
    }));
  }
}, [currentUser]);
  useEffect(() => {
  if (!socket) return;

// Load user database
const sendRequest = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "get_all_users" }));
    } else {
      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ action: "get_all_users" }));
      }, { once: true });
    }
  };
  sendRequest();

  return () => {
    socket.removeEventListener("open", sendRequest);
  };
}, [socket]);

// Log out
const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
    socket.close();
  };
   
// Handle profile editing
const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

// Handle new profile settings
const handleSave = () => {
    const trimmedUsername = formData.username.trim();
    const trimmedPassword = formData.password.trim();

    if (editingField === 'username') {
      if (!trimmedUsername) {
        alert("Username cannot be empty.");
        return;
      }
      if (trimmedUsername in users) {
        alert("Username already exists.");
        return;
      }
      // Send to backend
      socket.send(JSON.stringify({
        action: "update_user",
        oldUsername: currentUser,
        newUsername: trimmedUsername
      }));
      setFormData(prev => ({ ...prev, username: trimmedUsername }));
      setCurrentUser(trimmedUsername);
      localStorage.setItem("username", formData.username);

    }
    
    if (editingField === 'password') {
      if (!trimmedPassword) {
        alert("Password cannot be empty.");
        return;
      }

      socket.send(JSON.stringify({
        action: "update_password",
        username: currentUser,
        password: trimmedPassword
      }));
      setFormData(prev => ({ ...prev, password: trimmedPassword }));
    }

    setEditingField(null);
  };

  return (
    <div className="profile-page">
      <div className='profile-hamburger'><NavMenu/></div>
      <div className="profile-container">
        <h2>My Profile</h2>
        
        {/* User ID Section */}
        <div className="field-group">
          <label>User ID</label>
          <span className="profile-input">{localStorage.getItem("userId")}</span>
        </div>

        {/* Username Section */}
        <div className="field-group">
          <label>Username</label>
          {editingField === 'username' ? (
            <>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="profile-input"
              />
              <button className="save-btn" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <span>{formData.username}</span>
              <button className="edit-btn" onClick={() => setEditingField('username')}>Edit</button>
            </>
          )}
        </div>

        {/* Password Section */}
        <div className="field-group">
          <label>Password</label>
          {editingField === 'password' ? (
            <>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="profile-input"
              />
              <button className="save-btn" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <span>********</span>
              <button className="edit-btn" onClick={() => setEditingField('password')}>Edit</button>
            </>
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default ProfilePage;
