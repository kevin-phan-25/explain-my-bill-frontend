import { useState } from "react";
import { explainBill } from "../api";

export default function UploadBill({ sessionId }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const formData = new FormData();
    if (file) formData.append("bill", file);
    if (text) formData.append("text", text);
    if (sessionId) formData.append("sessionId", sessionId);

    try {
      const data = await explainBill(formData);
      setResult(data.explanation || data.error || "No response");
    } catch (err) {
      setResult("Error connecting to server");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Upload bill (PDF or image):</label><br />
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} style={{ marginTop: "5px" }} />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Or paste bill text:</label><br />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste extracted text here..."
            rows={8}
            style={{ width: "100%", padding: "10px" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "12px 24px", fontSize: "16px", background: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>
          {loading ? "Processing..." : "Explain My Bill"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "40px", padding: "20px", background: "#f9f9f9", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
          <h3>Explanation:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
