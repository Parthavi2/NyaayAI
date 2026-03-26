import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fakeScore, setFakeScore] = useState(null);
  const [fakeReason, setFakeReason] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Upload file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Backend error");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>NyāyaAI Legal Document Analyzer</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />

      <button onClick={handleUpload}>
        Analyze Document
      </button>

      {loading && <h3>Analyzing...</h3>}

      {result && (
        <div className="result">
          <h2>Extracted Text</h2>
          <p>{result.extracted_text}</p>

          <h2>Simplified</h2>
          <p>{result.simplified}</p>

          <h2>Risk Level</h2>
          <p>{result.risk_level}</p>

          <h2>Suggested Reply</h2>
          <p>{result.reply}</p>
        </div>
      )}
    </div>
  );
}

export default App;