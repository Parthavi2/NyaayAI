import React, { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [file, setFile] = useState(null);

  const [risk, setRisk] = useState(null);
  const [riskLevel, setRiskLevel] = useState("");

  const [timeline, setTimeline] = useState([]);

  const [fakeScore, setFakeScore] = useState(null);
  const [fakeReason, setFakeReason] = useState("");

  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [flags, setFlags] = useState([]);
  const [entities, setEntities] = useState([]);

  // ================= AI Fake Detection =================
  const detectFakeAI = async () => {
    setLoading(true);

    const res = await fetch("http://127.0.0.1:8000/detect-fake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    setFakeScore(data.score);
    setFakeReason(data.reason);
    setDecision(data.decision);
    setConfidence(data.confidence);
    setFlags(data.flags || []);
    setEntities(data.entities || []);

    setLoading(false);
  };

  // ================= Simplify =================
  const simplifyText = async () => {
    const res = await fetch("http://127.0.0.1:8000/simplify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  // ================= Reply =================
  const generateReply = async () => {
    const res = await fetch("http://127.0.0.1:8000/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setReply(data.reply);
  };

  // ================= Timeline =================
  const extractTimeline = async () => {
    const res = await fetch("http://127.0.0.1:8000/timeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setTimeline(data.timeline);
  };

  // ================= Risk =================
  const getRiskScore = async () => {
    const res = await fetch("http://127.0.0.1:8000/risk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    setRisk(data.score);
    setRiskLevel(data.level);
  };
const uploadAndAnalyze = async () => {
  if (!file) return;

  setUploadLoading(true);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  setUploadedText(data.text);
  setFakeScore(data.fake_score);
  setFakeReason(data.reason);
  setDecision(data.decision);
  setConfidence(data.confidence);
  setFlags(data.flags || []);
  setEntities(data.entities || []);
  setTimeline(data.timeline || []);
  setRisk(data.risk);
  setRiskLevel(data.risk_level);
  setReply(data.reply);

  setUploadLoading(false);
};
  // ================= Pages =================
  const renderPage = () => {
    switch (page) {
      case "detect":
        return (
          <div>
            <h2>AI Fake Legal Notice Detection</h2>

            <textarea
              rows="6"
              placeholder="Paste legal notice..."
              onChange={(e) => setText(e.target.value)}
            />

            <div className="btnRow">
              <button onClick={detectFakeAI}>Analyze AI</button>
              <button onClick={extractTimeline}>Timeline</button>
              <button onClick={getRiskScore}>Risk</button>
            </div>

            {loading && <div className="loader">AI analyzing...</div>}

            {fakeScore !== null && (
              <div className="aiCard">

                <h2>AI Decision</h2>

                <div className={`decision ${fakeScore > 60 ? "fake" : "real"}`}>
                  {decision}
                </div>

                <h3>Confidence: {confidence}%</h3>

                <div className="meter">
                  <div
                    className="meterFill"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>

                <h3>Fake Probability: {fakeScore}%</h3>

                <h3>AI Reasoning</h3>
                <p>{fakeReason}</p>

                <h3>Red Flags</h3>
                <ul>
                  {flags.map((f, i) => (
                    <li key={i}>⚠️ {f}</li>
                  ))}
                </ul>

                <h3>Extracted Entities</h3>
                {entities.map((e, i) => (
                  <div key={i} className="entity">
                    <strong>{e.label}</strong> : {e.value}
                  </div>
                ))}
              </div>
            )}

            {risk !== null && (
              <div className="riskBox">
                <h3>Risk Score: {risk}</h3>
                <h4>{riskLevel}</h4>
              </div>
            )}

            {timeline.length > 0 && (
              <div className="timelineBox">
                <h3>Timeline</h3>

                {timeline.map((item, index) => (
                  <div key={index} className="timelineItem">
                    <strong>{item.date}</strong>
                    <p>{item.event}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "upload":
return (
<div>

<h2>Upload Legal Notice AI</h2>

<input
type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button onClick={uploadAndAnalyze}>
Upload & Analyze
</button>

{uploadLoading && (
<div className="loader">
Analyzing document...
</div>
)}

{uploadedText && (
<div className="aiCard">
<h3>Extracted Text</h3>
<p>{uploadedText}</p>
</div>
)}

{reply && (
<div className="aiCard">
<h3>AI Reply</h3>
<pre>{reply}</pre>
</div>
)}

</div>
);
      case "simplify":
        return (
          <div>
            <h2>AI Simplify</h2>

            <textarea
              rows="6"
              onChange={(e) => setText(e.target.value)}
            />

            <button onClick={simplifyText}>Simplify</button>

            <p>{result}</p>
          </div>
        );

      case "reply":
        return (
          <div>
            <h2>Reply Generator</h2>

            <textarea
              rows="6"
              onChange={(e) => setText(e.target.value)}
            />

            <button onClick={generateReply}>Generate Reply</button>

            <button
              onClick={() => navigator.clipboard.writeText(reply)}
            >
              Copy Reply
            </button>

            <pre>{reply}</pre>
          </div>
        );

      default:
        return (
          <div>
            <h1>NyaayAI Dashboard</h1>

            <div className="cards">
              <div className="card" onClick={() => setPage("detect")}>
                🧠 AI Fake Detection
              </div>

              <div className="card" onClick={() => setPage("simplify")}>
                📄 Simplify Notice
              </div>

              <div className="card" onClick={() => setPage("reply")}>
                ✉️ Generate Reply
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>NyaayAI</h2>

        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("detect")}>Fake Detection</button>
        <button onClick={() => setPage("simplify")}>Simplify</button>
        <button onClick={() => setPage("reply")}>Reply</button>
        <button onClick={() => setPage("upload")}>
Upload AI
</button>
      </div>

      <div className="content">{renderPage()}</div>
    </div>
  );
}

export default App;