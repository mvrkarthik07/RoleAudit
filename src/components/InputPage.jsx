import { useState, useRef } from "react";
import { parseResumeFile, validateResumeFile } from "../utils/parseResumeFile";

function InputPage({ onAnalyze }) {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef(null);

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setParseError(validation.error);
      return;
    }

    setParseError("");
    setIsParsing(true);

    try {
      const result = await parseResumeFile(file);
      
      if (result.success) {
        setResume(result.text);
        setParseError("");
      } else {
        setParseError(result.error || "Failed to parse file");
      }
    } catch (error) {
      setParseError(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="card" style={{ 
      maxWidth: "900px", 
      margin: "0 auto",
      width: "100%"
    }}>
      <div style={{ marginBottom: "clamp(var(--space-6), 6vw, var(--space-10))" }}>
        <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
          Job Description
        </h2>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
          Paste the complete job posting
        </p>
      </div>
      
      <label className="label" htmlFor="jd-input">
        Job Description Text
      </label>
      <textarea
        id="jd-input"
        className="textarea"
        rows={12}
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the complete job description including responsibilities, requirements, and qualifications..."
      />

      <div style={{ 
        height: "1px", 
        background: "var(--border)", 
        margin: "var(--space-10) 0" 
      }}></div>

      <div style={{ marginBottom: "var(--space-10)" }}>
        <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
          Resume
        </h2>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
          Upload a file or paste your resume text
        </p>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          disabled={isParsing}
          id="resume-upload"
          style={{ display: "none" }}
        />
        <label
          htmlFor="resume-upload"
          className="btn btn-secondary"
          style={{
            display: "inline-block",
            cursor: isParsing ? "not-allowed" : "pointer",
            opacity: isParsing ? 0.5 : 1
          }}
        >
          {isParsing ? "Processing..." : "Upload PDF or DOCX"}
        </label>
        {!isParsing && (
          <span style={{ 
            marginLeft: "var(--space-3)", 
            fontSize: "var(--text-sm)", 
            color: "var(--text-tertiary)",
            display: "inline-block",
            marginTop: "var(--space-2)"
          }}>
            or paste text below
          </span>
        )}
      </div>

      {parseError && (
        <div style={{
          padding: "var(--space-3)",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--space-4)",
          fontSize: "var(--text-sm)",
          color: "var(--danger)"
        }}>
          <strong>Error:</strong> {parseError}
        </div>
      )}

      <div style={{
        padding: "var(--space-3)",
        background: "var(--bg-primary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        marginBottom: "var(--space-4)",
        fontSize: "var(--text-sm)",
        color: "var(--text-tertiary)"
      }}>
        <strong>Note:</strong> Files are converted to plain text. Formatting may be simplified.
      </div>

      <label className="label" htmlFor="resume-input">
        Resume Text
      </label>
      <textarea
        id="resume-input"
        className="textarea"
        rows={12}
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        placeholder="Paste your resume text here, or upload a PDF/DOCX file above..."
      />

      <div style={{ 
        height: "1px", 
        background: "var(--border)", 
        margin: "var(--space-10) 0" 
      }}></div>

      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
          Cover Letter
          <span style={{ 
            fontSize: "var(--text-sm)", 
            fontWeight: "var(--font-normal)", 
            color: "var(--text-tertiary)",
            marginLeft: "var(--space-2)"
          }}>
            (Optional)
          </span>
        </h2>
        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
          Additional context for your application
        </p>
      </div>
      
      <label className="label" htmlFor="cover-letter-input">
        Cover Letter Text
      </label>
      <textarea
        id="cover-letter-input"
        className="textarea"
        rows={8}
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        placeholder="Paste your cover letter here (optional)..."
      />

      <div style={{ 
        marginTop: "var(--space-8)", 
        paddingTop: "var(--space-6)", 
        borderTop: "1px solid var(--border)",
        textAlign: "center"
      }}>
        <button
          onClick={() => onAnalyze(jd, resume, coverLetter)}
          disabled={!jd || !resume || isParsing}
          className="btn btn-primary"
          style={{ 
            minWidth: "200px",
            width: "100%",
            maxWidth: "400px"
          }}
        >
          Analyze Role Readiness
        </button>
        {(!jd || !resume) && (
          <p style={{ 
            margin: "var(--space-4) 0 0", 
            fontSize: "var(--text-sm)", 
            color: "var(--text-tertiary)"
          }}>
            Please provide both job description and resume to continue
          </p>
        )}
      </div>
    </div>
  );
}

export default InputPage;
