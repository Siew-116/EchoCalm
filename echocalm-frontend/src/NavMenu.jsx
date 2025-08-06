import { Link } from "react-router-dom";
import { useState } from "react";

function NavMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "white",
      padding: "10px 20px",
      position: "relative"
    }}>
      {/* Hamburger Icon */}
      <div onClick={toggleMenu} style={{ cursor: "pointer", fontSize: "24px" }}>
        ☰  EchoCalm
      </div>

      <div style={{ fontSize: "18px", fontWeight: "bold" }}></div>

      {/* Side Menu Drawer */}
      {showMenu && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "260px",
          backgroundColor: "#2d3e50",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          zIndex: 100,
          padding: "20px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>

          {/* Close Button */}
          <div 
            onClick={toggleMenu}
            style={{ textAlign: "right", 
                cursor: "pointer", 
                marginBottom: "20px" }}
          >
            ✕
          </div>

          {/* User Profile */}
          <Link to="/profile"  style={{...menuItemStyle}}
          onClick={(e) => {
            if (!confirmLeaveSession()) {
              e.preventDefault();
            }
          }}>
            👤 My Profile
          </Link>

          <Link to="/sessions" style={{...menuItemStyle}}
          onClick={(e) => {
            if (!confirmLeaveSession()) {
              e.preventDefault();
            }
          }}>
            💬 Home
          </Link>
          
          <Link to="/help" style={{...menuItemStyle}}
          onClick={(e) => {
            if (!confirmLeaveSession()) {
              e.preventDefault();
            }
          }}>
            ❓ Help
          </Link>

        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  background: "none",
  border: "none",
  textAlign: "left",
  color: "#fff",
  fontSize: "16px",
  padding: "12px 0",
  cursor: "pointer",
  borderBottom: "1px solid #4a5a6a", 
  width: "100%",
  fontFamily: "inherit",
  outline: "none" 
};

const confirmLeaveSession = () => {
  if (sessionData?.id && !sessionData?.endTime) {
    return window.confirm("⚠️ You have an ongoing session. Leaving this page may discard your chat. Do you want to continue?");
  }
  return true; 
};

export default NavMenu;
