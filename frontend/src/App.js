import { useState, useEffect } from "react";
import UploadBill from "./components/UploadBill";
import Billing from "./components/Billing";

function App() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sess = params.get("session_id");
    if (sess) {
      setSessionId(sess);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Explain My Bill</h1>
      <p>Upload a medical or dental bill (PDF/image) or paste text — get a clear AI explanation.</p>

      {!sessionId && <Billing />}
      <UploadBill sessionId={sessionId} />

      {sessionId && <p style={{ color: "green", fontWeight: "bold" }}>✅ Full explanation unlocked!</p>}
    </div>
  );
}

export default App;
