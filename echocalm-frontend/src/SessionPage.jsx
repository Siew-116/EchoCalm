// src/pages/SessionPage.jsx

import {useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWebSocket } from './WebSocketContext';
import NavMenu from "./NavMenu";
import "./SessionPage.css";
import "./generateReport.js";
import { generateReport } from "./generateReport.js";

function SessionPage({ currentUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const completedSession = location.state?.savedSession; 
    const {socket} = useWebSocket("sessions");
    const [sessions, setSessions] = useState([]);
    const storedUserId = localStorage.getItem("userId");
    const [searchDate, setSearchDate] = useState("");
    const [hasSent, setHasSent] = useState(false);
    const date = new Date();

    const formattedDate = `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })}`;

    // Load session history from backend
    useEffect(() => {
      if (!socket) return;

      const sendRequest = () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ action: "load_sessions", id: storedUserId }));
        } else {
          socket.addEventListener("open", () => {
            socket.send(JSON.stringify({ action: "load_sessions", id: storedUserId }));
          }, { once: true });
        }
      };
      sendRequest();
      return () => {
        socket.removeEventListener("open", sendRequest); // Clean up to avoid memory leaks
      };
    }, [socket, currentUser]);

    // Get session history if success
    useEffect(() => {
      const handleMessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.status === "success" && msg.sessions) {
          setSessions(msg.sessions.reverse());
        }
      };
      socket?.addEventListener("message", handleMessage);
      return () => socket?.removeEventListener("message", handleMessage);
    }, [socket]);

    // Generate User ID
    const generateId = (storedUserId) => {
      const time = Date.now().toString(36);  // base36 timestamp
      const rand = Math.random().toString(36).substr(2, 5); // 5-char random
      return `${storedUserId}_${time}_${rand}`;
    };

    // Start new chat session
    const startSession = () => {
        const newSession = {
            sessionId: generateId(storedUserId), // sessionID
            id: storedUserId, // user ID
            username: currentUser,
            startedAt: formattedDate,
            endTime: null,
            mood: null,
            notes: "",
            messages: []
        };

        // Pass to ChatPage via router state
        navigate("/chat", {
          state: { currentSession: newSession }
        });
    };

    // Save session to backend
    useEffect(() => {
      if (!completedSession || hasSent) return;

      const sendSession = () => {
        const payload = {
          action: "save_session",
          data: completedSession
        };

        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(payload));
          setHasSent(true)
        } else {
          socket.addEventListener("open", () => {
            socket.send(JSON.stringify(payload));
            setHasSent(true)
          }, { once: true });
        }
      };
      sendSession();
      setHasSent(true); 
    }, [completedSession, socket]);

    // Filter sessions by date 
    const filteredSessions = sessions.filter((session) => {
      if (!searchDate) return true;
      const [year, month, day] = searchDate.split("-");
      const formattedSearchDate = `${day}/${month}/${year}`;
      const sessionDateOnly = session.startedAt.split(" ")[0]; 
      return sessionDateOnly === formattedSearchDate;
    });
    
    // Calculate duration of each session
    function getDuration(start, end) {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const diff = Math.round((endTime - startTime) / 1000); // in seconds
      const min = Math.floor(diff / 60);
      const sec = diff % 60;
      return `${min}m ${sec}s`;
    }

  const handleDeleteSession = (sessionId) => {
    if (!window.confirm("Delete this session?")) return;

    const payload = {
      action: "delete_session",
      sessionId: sessionId,
      userId: storedUserId
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }

    // Optimistically update UI
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  };


  return (
    <div className="session-container">
      <div className='session-hamburger'><NavMenu/></div>
      <h1 className="session-title">Where Echo Meets Calm</h1>

      <div className="session-options">
        <button className="start-session" onClick={startSession}>+ New Chat Session</button>
      </div>

      <div className="session-search">
        <h3 className="session-search-title">Past Chat Sessions</h3>
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="date-search-input"
        />
      </div>

      <div className="session-list-placeholder">
        {sessions.length === 0 ? 
        ( <p>Not sessions yet.</p>) : 
        (
            <div className="session-grid">
            {filteredSessions.map((session) => (
              <div className="session-card" key={session.sessionId}>
                <h4 style={{fontWeight: 900}}>Session #{session.sessionId.slice(-14)}</h4>
                <p className="session-label">Duration:</p>
                <p className="session-value">{getDuration(session.startedAt, session.endTime)}</p>
                <p className="session-label">Started:</p>
                <p className="session-value">{session.startedAt}</p>
             
             <div className="session-card-buttons">
              <button
                className="view-report-btn"
                onClick={() => generateReport(session)}
              >
                View Report
              </button>
              <button
                className="delete-session-btn"
                onClick={() => handleDeleteSession(session.sessionId)}
              >
                Delete
              </button>
              </div>
              </div>
            ))}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionPage;
