import jsPDF from "jspdf";

export const generateReport = (sessionData) => {
  const doc = new jsPDF();
  const marginLeft = 15;
  let y = 10;

  const line = (label, value) => {
    doc.text(`${label}: ${value}`, marginLeft, y);
    y += 8;
  };

  // Helper: calculate duration in minutes/seconds
  const getDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const duration = sessionData.startedAt && sessionData.endTime
    ? getDuration(sessionData.startedAt, sessionData.endTime)
    : "N/A";

  line("User ID", sessionData.id);
  line("Username", sessionData.username || "N/A");
  line("Session ID", sessionData.sessionId.slice(-14));
  line("Duration",duration);
  line("Start At", sessionData.startedAt);
  line("End At", sessionData.endTime);
  line("Mood", sessionData.mood || "Not provided");
  line("Notes", sessionData.notes || "No notes");

  y += 8;
  doc.text("Messages:", marginLeft, y);
  y += 8;

  sessionData.messages.forEach((msg, idx) => {
    const sender = msg.role === "user" ? "User" : "Avatar";
    const content = `${sender}: ${msg.content}`;
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, marginLeft, y);
    y += lines.length * 6;
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`Session_Report_${sessionData.sessionId}.pdf`);
};
