import { useState, useEffect } from 'react'
import { useWebSocket } from './WebSocketContext';
import { useLocation } from 'react-router-dom';
import NavMenu from "./NavMenu";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import AvatarPanel from "./AvatarPanel";
import "./ChatPage.css";

function ChatPage() {
  const location = useLocation();
  const session = location.state?.currentSession; // get session data from location state
  const [sessionData, setSessionData] = useState(() => session || {});  // track session
  const [messages, setMessages] = useState([
    {
    role: "assistant",
    content: "You found me...I'm still here, just like before. Speak — I’m listening.",
    } 
  ]) // store array of chat messages
  const { socket, isReady, send, setMessageHandler } = useWebSocket("chat");
  const [personality, setPersonality] = useState({preset: "Calm", tone:0.5, authority:0.5, empathy:0.5}); // store personality settings
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState("");
  const [language, setLanguage] = useState(navigator.language || "en-US"); // EN-US as default language 
  const [voiceMode, setVoiceMode] = useState(false); // voice mode toggle
  const [isListening, setIsListening] = useState(false);  // track STT 
  const lastAssistantMsg = messages
    .slice()
    .reverse()
    .find(msg => msg.role === "assistant")?.content || "";
  const [ttsPending, setTtsPending] = useState(false);
  const [lastSpokenMsg, setLastSpokenMsg] = useState(false);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [showDetectWarning, setShowDetectWarning] = useState(false);
  
  // Handle chat message
  useEffect(() => {
    setMessageHandler((event) => {
      try {
        const data = JSON.parse(event.data);

        // Skip pong
        try {
          const parsed = JSON.parse(data.content);
          if (parsed?.response === "pong") {
            return;
          }
        } catch {}

        if (data.role && data.content) {
          setMessages(prev => [...prev, { role: data.role, content: data.content }]);
          setIsTyping(false);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", event.data);
      }
    });
  }, [setMessageHandler]);

  // Send user message to backend through WebSocket
  const sendMessage = (msg) => {
    if (!isReady) {
      console.warn("WebSocket not connected yet. Retrying in 500ms...");
      setTimeout(() => sendMessage(msg), 1000);
      return;
    }
    const payload = {
      message: msg,
      personality: personality
    };
    setMessages(prev => [...prev, {role:"user", content:msg}]);
    setIsTyping(true);
    socket.send(JSON.stringify(payload)); // send data in JSON format
  };

  // Sync up personality
  useEffect( ()=> {
    if (isReady) {
    socket.send(JSON.stringify({ type: "personality_update", personality }));
  }
}, [personality, isReady]);

  // Typing animation
  useEffect(()=>{
    let interval;
    if (isTyping) {
      interval = setInterval(()=> {
        setTypingDots(prev => (prev.length<3 ? prev+"." : ""));
      }, 800); // 800ms per dot
    } else {
      setTypingDots(""); // reset when not typing
    }
  }, [isTyping]);

  // Handle TTS for assistant
  useEffect(() => {
    if (!voiceMode) {
      speechSynthesis.cancel();
      setTtsPending(false);
      return;
    }

    if (isListening) {
      speechSynthesis.cancel();
      setTtsPending(false);
      setLastSpokenMsg(lastAssistantMsg);
      return;
    }

    if (ttsPending && lastAssistantMsg && lastAssistantMsg !== lastSpokenMsg) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastAssistantMsg);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onend = () => {
        setTtsPending(false);
        setLastSpokenMsg(lastAssistantMsg);

      if (lastAssistantMsg.trim().length === 0) {
          setShowTimeoutWarning(true); // Force warning if response is empty
          setTimeout(() => {
            setShowTimeoutWarning(false);
          }, 3000);
        }
      };

      speechSynthesis.speak(utterance);
    }
  }, [lastAssistantMsg, ttsPending, voiceMode, language, isListening, lastSpokenMsg, rate, pitch, volume]);

 
return (
  <div className="chat-page">
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-header-inner">
          <div className="chat-header-nav">
            <NavMenu />
          </div>
          <div className="chat-title">EchoCalm Chat</div>
        </div>
      </header>

      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        typingDots={typingDots}
      />

      {isListening && (
        <div className="overlay-message">
          Speak now... <br />
          Tap the microphone again to finish
        </div>
      )}

      {showTimeoutWarning && (
        <div className="warning-popup">
          ⚠️ Assistant is taking longer than expected..Please try again.
        </div>
      )}

      {showDetectWarning && (
        <div className="warning-popup">
          ⚠️ Failed to detect...Please try again.
        </div>
      )}

      <MessageInput
        onSend={sendMessage}
        language={language}
        lastAssistantMsg={lastAssistantMsg}
        voiceMode={voiceMode}
        setIsListening={setIsListening}
        setTtsPending={setTtsPending}
        setShowDetectWarning={setShowDetectWarning}
      />
    </div>

    <AvatarPanel
      sessionData={sessionData}
      setSessionData={setSessionData}
      messages={messages}
      personality={personality}
      setPersonality={setPersonality}
      language={language}
      setLanguage={setLanguage}
      voiceMode={voiceMode}
      setVoiceMode={setVoiceMode}
      pitch={pitch}
      setPitch={setPitch}
      rate={rate}
      setRate={setRate}
      volume={volume}
      setVolume={setVolume}
    />
  </div>
);
}

export default ChatPage