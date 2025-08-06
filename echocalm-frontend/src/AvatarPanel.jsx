import { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./AvatarPanel.css";

export default function AvatarPanel({ 
  sessionData, setSessionData,
  messages,
  personality, setPersonality, 
  language, setLanguage, 
  voiceMode, setVoiceMode, 
  pitch, setPitch, 
  rate, setRate, 
  volume, setVolume }) 
  {
  const navigate = useNavigate();
  const [tunedPitch, setTunedPitch] = useState(1);
  const [tunedRate, setTunedRate] = useState(1);
  const [tunedVolume, setTunedVolume] = useState(1);
  const [testMessage, setTestMessage] = useState("Hello, it's me! You can test my voice here.");
  const settingsEndRef = useRef(null);
  const [elapsed, setElapsed] = useState("");
  const [showEndPrompt, setShowEndPrompt] = useState(false);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const date = new Date();
  
  // Formate date and time
  const formattedDate = `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })}`;
  
  // Warn unsaved ongoing session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (sessionData?.id) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionData?.id]);

  // Scrolling 
  useEffect(() => {
      settingsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

  // Display session start time and live duration
  useEffect(() => {
    if (!sessionData?.startedAt) return;

    // Parse the custom formatted date string: "DD/MM/YYYY HH:MM:SS"
    const [datePart, timePart] = sessionData.startedAt.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");

    const start = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now - start;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setElapsed(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.startedAt]);
  
  // Update avatar settings
  const updatePersonality = (key, value) => {
    setPersonality({ ...personality, [key]: value });
  };

  // Handle voice testing
  const handleTestVoice = () => {
    const utterance = new SpeechSynthesisUtterance(testMessage);
    utterance.lang = language;
    utterance.pitch = tunedPitch;
    utterance.rate = tunedRate;
    utterance.volume = tunedVolume;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // Aplly new voice to avatar
  const applyNewVoice = () => {
    setPitch(tunedPitch);
    setRate(tunedRate);
    setVolume(tunedVolume);
  }
  
  // End chat session
  const endSession = async () => {
    const sessionId = sessionData.id;
    if (!sessionId) {
      alert("No session in progress.");
      return;
    }

    const endTime = formattedDate;
    const sessionToSave = {
    ...sessionData,
    endTime,
    mood,
    notes,
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  };
    
    setSessionData({});
    setShowEndPrompt(false);
    alert("Session ended and recorded!");
    navigate("/sessions", {
      state: { savedSession: sessionToSave }
    });
  };


return (
  <div className="chat-settings">
    <h3>Chat Info</h3>
    <div className="chat-info">
      Session ID: {sessionData.sessionId.slice(-14)|| 'Unknown'}
      <br />
      Start: {sessionData.startedAt}
      <br />
      ⏱ Duration: {elapsed}
    </div>

    <button className="end-session-btn" onClick={() => setShowEndPrompt(true)}>
      End Session
    </button>

    {showEndPrompt && (
    <>
      <div className="popup-backdrop" onClick={() => setShowEndPrompt(false)}></div>
      <div className="popup-overlay">
        <div className="popup-card">
          <h3>End Session</h3>

          <label>Mood:</label>
          <input 
            value={mood} 
            onChange={e => setMood(e.target.value)} 
            placeholder="😊, 😐, 😢 or 1–5" 
          />

          <label>Notes:</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Your thoughts..." 
          />

          <div className="popup-buttons">
            <button className="cancel-btn" onClick={() => setShowEndPrompt(false)}>Cancel</button>
            <button className="save-session-btn" onClick={endSession}>Save</button>
          </div>
        </div>
      </div>
    </>
  )}
  
    <hr className="section-divider" />

    <h3>Avatar Settings</h3>

    {/* Language Selector */}
    <div className="language-selector">
      <label>Language:</label>
      <select className="select-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en-US">English (US)</option>
        <option value="en-GB">English (UK)</option>
        <option value="es-ES">Spanish</option>
        <option value="fr-FR">French</option>
        <option value="de-DE">German</option>
        <option value="zh-CN">Chinese</option>
        <option value="ja-JP">Japanese</option>
        <option value="ms-MY">Malay</option>
        <option value="ko-KR">Korean</option>
      </select>
    </div>

    <label>
      Personality:
    </label>
      <select
        className="select-input"
        value={personality.preset}
        onChange={(e) => updatePersonality("preset", e.target.value)}
      >
        <option value="Calm">Calm</option>
        <option value="Challenging">Challenging</option>
        <option value="Supportive">Supportive</option>
      </select>

    <div className="tuners">
    {/* Tone Tuner */}
    <div className="tuner">
      <label className="tuner-label">Tone</label>
      <input className="tone-slider" type="range" min="0" max="1" step="0.1" value={personality.tone}
        onChange={(e) => updatePersonality("tone", parseFloat(e.target.value))} />
      <div className="tuner-value">Current: {personality.tone}</div>
    </div>

    {/* Authority Tuner */}
    <div className="tuner">
      <label className="tuner-label">Authority</label>
      <input className="authority-slider" type="range" min="0" max="1" step="0.1" value={personality.authority}
        onChange={(e) => updatePersonality("authority", parseFloat(e.target.value))} />
      <div className="tuner-value">Current: {personality.authority}</div>
    </div>

    {/* Empathy Tuner */}
    <div className="tuner">
      <label className="tuner-label">Empathy</label>
      <input className="empathy-slider" type="range" min="0" max="1" step="0.1" value={personality.empathy}
        onChange={(e) => updatePersonality("empathy", parseFloat(e.target.value))} />
      <div className="tuner-value">Current: {personality.empathy}</div>
    </div>
    </div>
    <hr className="section-divider" />


    <h3>Voice Settings</h3>
    {/* Voice Mode Toggle */}
        <div className="voice-mode">
          <button
            className={`voice-toggle-btn ${voiceMode ? 'on' : 'off'}`}
            onClick={() => setVoiceMode(!voiceMode)}
          >
            {voiceMode ? "Voice Mode: ON" : "Voice Mode: OFF"}
          </button>
        </div>

    {/* Voice Settings */}
    <div className="tuner">
      <label className="tuner-label">Pitch</label>
      <input className="pitch-slider" type="range" min="0.5" max="2.5" step="0.05" value={tunedPitch}
        onChange={(e) => { setTunedPitch(parseFloat(e.target.value)); applyNewVoice(); }} />
        <div className="tuner-value">Current: {pitch.toFixed(2)}</div>
    </div>

    <div className="tuner">
      <label className="tuner-label">Rate</label>
      <input className="rate-slider" type="range" min="0.5" max="2" step="0.05" value={tunedRate}
        onChange={(e) => { setTunedRate(parseFloat(e.target.value)); applyNewVoice(); }} />
        <div className="tuner-value">Current: {rate.toFixed(2)}</div>
    </div>

    <div className="tuner">
      <label className="tuner-label">Volume</label>
      <input className="volume-slider" type="range" min="0" max="1" step="0.05" value={tunedVolume}
        onChange={(e) => { setTunedVolume(parseFloat(e.target.value)); applyNewVoice(); }} />
        <div className="tuner-value">Current: {volume.toFixed(2)}</div>
    </div>

    {/* Custom Test Message */}
    <textarea
      className="test-message"
      rows="2"
      value={testMessage}
      onChange={(e) => setTestMessage(e.target.value)}
    />

    {/* Voice Test Button */}
    <button className="voice-test-btn" onClick={handleTestVoice}>
      🔊 Test Voice
    </button>

    <div ref={settingsEndRef}></div>
  </div>
  );
}
 