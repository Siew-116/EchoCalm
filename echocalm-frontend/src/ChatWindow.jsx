import { useState, useEffect, useRef } from "react";

function ChatWindow({ messages, isTyping, typingDots }) {
  const chatEndRef = useRef(null);
  const [showEmergency, setShowEmergency] = useState(false);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "15px",
        backgroundColor: "#1f2a3dff",
        display: "flex",
        flexDirection: "column"
      }}>
      {showEmergency && (
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001
      }}>

        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <h3 style={{ color: "#d62828", fontWeight: "bold" }}>Emergency Help</h3>
          <p> If you're feeling overwhelmed or in danger,<br></br> 
              you're not alone. Help is available. </p>

          <div style={{ textAlign: "left", marginTop: "20px", fontSize: "14px", lineHeight: "1.6" }}>
            <strong>📞 Talk to someone:</strong><br />
            USA: <a href="https://988lifeline.org" target="_blank">988 Lifeline</a> or 988<br />
            UK: <a href="https://www.samaritans.org/how-we-can-help/contact-samaritan/" target="_blank">Samaritans</a> or 116 123<br />
            Australia: <a href="https://www.lifeline.org.au/" target="_blank">Lifeline</a> or 13 11 14<br />
            Canada: <a href="https://988.ca/" target="_blank">Suicide Crisis Helpline</a> or 9-8-8<br />
            India: <a href="https://icallhelpline.org/" target="_blank">iCall Helpline</a> or 9152987821<br />
          </div>

          <p style={{ fontSize: "13px", marginTop: "10px" }}>
          🌍  Find more hotlines worldwide at <a href="https://findahelpline.com/" target="_blank" style={{ color: "#007bff" }}>findahelpline.com</a>
          </p>

          <p style={{ fontSize: "15px",marginTop: "20px", marginBottom: "12px" }}>
                    In case of emergency:<br />
                    <strong>Call 999</strong> immediately. </p>

          <button onClick={() => setShowEmergency(false)} style={{
            marginTop: "20px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer"
          }}>
            Close
          </button>
        </div>
  </div>
)}

      {/* 🚨 Emergency Button */}
      <div style={{ display: "flex", justifyContent: "right", marginBottom: "10px" }}>
        <button
          onClick={() => setShowEmergency(true)}
          style={{
            position: "absolute",
            marginTop: "450px",
            backgroundColor: "#f41a13ff",
            color: "white",
            border: "none",
            borderRadius: "100px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          🚨 Need help?
        </button>
      </div>

      {/* Chat Messages */}
      {messages.map((msg, index) => (
        <div key={index} style={{
          display: "flex",
          justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          marginBottom: "10px"
        }}>
          
          <div style={{
            maxWidth: "50%",
            padding: "10px 15px",
            borderRadius: "18px",
            color: msg.role === "user" ? "#233554" : "#E6F1FF",
            backgroundColor: msg.role === "user" ? "#B9DEF0" : "#233554",
            textAlign: "left",
            wordWrap: "break-word"
          }}>
            {msg.content}
          </div>

         
        </div>
      ))}

      {/* Response Loading */}
      {isTyping && (
      <div style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "10px"
      }}>
        <div style={{
          maxWidth: "50%",
          padding: "10px 15px",
          borderRadius: "18px",
          backgroundColor: "#233554",
          color: "#E6F1FF",
          fontSize: "16px",
          fontStyle: "italic",
          fontWeight: "500"
        }}>
          Cooking up a reply{typingDots}
        </div>

        
      </div>
    )}

      <div ref={chatEndRef}></div>
    </div>
  );
}

export default ChatWindow;


