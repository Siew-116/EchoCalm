import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from "./WebSocketContext";
import Loader from "./Loader";
import AuthPage from "./AuthPage";
import TermsPage from "./TermsPage";
import HelpPage from "./HelpPage";
import ProfilePage from "./ProfilePage";
import ChatPage from "./ChatPage";
import SessionPage from "./SessionPage";

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [username, setUsername] = useState(null);

  // Load username from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
  
    if (storedUser) {
      setUsername(storedUser);
    }
  
  }, []);

  return (
  
    <WebSocketProvider>
      {loading && <Loader text={loadingText} />}
    
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route
          path="/auth"
          element={<AuthPage setLoading={setLoading} setLoadingText={setLoadingText} currentUser={username} setCurrentUser={setUsername}/>}
        />
        <Route
          path="/profile"
          element={<ProfilePage setLoading={setLoading} setLoadingText={setLoadingText} currentUser={username} setCurrentUser={setUsername} />}
        />
        <Route
          path="/chat"
          element={<ChatPage setLoading={setLoading} setLoadingText={setLoadingText} />}
        />
        <Route
          path="/sessions"
          element={<SessionPage setLoading={setLoading} setLoadingText={setLoadingText} currentUser={username} />}
        />
        <Route
          path="/terms"
          element={<TermsPage setLoading={setLoading} setLoadingText={setLoadingText} />}
        />
        <Route
          path="/help"
          element={<HelpPage setLoading={setLoading} setLoadingText={setLoadingText} />}
        />
      </Routes>
    
  </WebSocketProvider>
  );
}

export default App
