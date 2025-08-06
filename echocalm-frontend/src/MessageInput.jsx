import { useState, useEffect, useRef } from "react";

function MessageInput({ onSend, language, lastAssistantMsg, voiceMode, setIsListening, setTtsPending, setShowDetectWarning }) {
  const [input, setInput] = useState(""); // input message
  const [isListeningLocal, setIsListeningLocal] = useState(false);  // voice input
  const speechRef = useRef(null);

  // Send message with button
  const handleSend = () => {
    if (input.trim() === "") return;
    onSend(input);
    setInput("");
    speechSynthesis.cancel();
    setTtsPending(true);
  };

  // Send message with ENTER
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // STT 
  useEffect( ()=>{
    
    if (!("webkitSpeechRecognition" in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = false; // only final result
    recognition.maxAlternatives = 1;  // return best guess only
    recognition.continuous = true;
    
    // Start listening
    recognition.onstart = () => {
      setIsListeningLocal(true);
      setIsListening(true); // Notify App
      speechSynthesis.cancel(); // Stop TTS when user starts speaking
      setTtsPending(false); 
      setShowDetectWarning(false);
    };

    // Update recognized text in chat
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;  // recognized text
      setInput(transcript);
      speechSynthesis.cancel();

       if (transcript.trim().length <= 0) {
        setShowDetectWarning(true); // Warn user to speak something
        setTimeout(() => {
          setShowDetectWarning(false);
        }, 3000);
      }

    };

    // Handle when user finish talking
    recognition.onend = () => {
      setIsListeningLocal(false);
      setIsListening(false);
      speechSynthesis.cancel();
      
    };

    recognition.onerror = (err) => console.error("STT Error:", err);
    
    // Store recoginition in a Ref
    speechRef.current = recognition;
  }, [language, voiceMode, setShowDetectWarning]);

  // Trigger listening
  const toggleListening = () =>{
   
    if (isListeningLocal) { 
      speechRef.current.stop();
    
     }
    else { 
       speechRef.current.lang = language;
       speechRef.current.start(); 
      
    }
  } 
  
  return (
    <div style={{
      display: "flex",
      padding: "15px",
      borderTop: "1px solid #233554",
      backgroundColor: "#1f2a3dff"
    }}>
      {/*Input box*/}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        style={{
          flex: 1,
          padding: "10px 15px",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#233554",
          border: "1px solid #233554",
          borderRadius: "16px",
          outline: "none"
        }}
      />
      {/*Microphone button*/}
      <button
        onClick={toggleListening}
        style={{
          marginLeft: "10px",
          padding: "10px 20px",
          backgroundColor: isListeningLocal ? "#FF6B6B" : "#B9DEF0",
          color: "#fff",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer"
        }}>
        🎤
      </button>
      {/*Send button*/}
      <button
        onClick={handleSend}
        style={{
          marginLeft: "15px",
          padding: "5px 15px",
          backgroundColor: "#B9DEF0",
          color: "#0A192F",
          border: "none",
          borderRadius: "16px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "0.3s ease"
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#abd9f0ff")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#B9DEF0")}
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
