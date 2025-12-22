import { useState } from "react";

import { inferRoleFromJD } from "./logic/inferRoleFromJD";
import { extractResumeSignals } from "./logic/extractResumeSignals";
import { scoreDimensions } from "./logic/scoreDimensions";
import { applyScoreSmoothing } from "./logic/applyScoreSmoothing";
import { generateAnalysis } from "./logic/generateAnalysis";
import { applyCoverLetterModifier } from "./logic/applyCoverLetterModifier";
import { extractEducationRequirements } from "./logic/extractEducationRequirements";
import { scoreEducationFit, scoreFullTimeFit } from "./logic/scoreEducationFit";
import { extractJDEvidence } from "./logic/extractJDEvidence";
import { extractResumeEvidence } from "./logic/extractResumeEvidence";

import InputPage from "./components/InputPage";
import ResultsPage from "./components/ResultsPage";

function isLowInformationJD(jdText) {
  const words = jdText.trim().split(/\s+/);
  return words.length < 30;
}

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function handleAnalyze(jd, resume, coverLetter) {
    // Edge case: empty or invalid inputs
    if (!jd || typeof jd !== 'string' || jd.trim().length === 0) {
      setAnalysis({
        error: true,
        title: "Invalid Job Description",
        message: "Please provide a valid job description.",
        guidance: [
          "The job description field cannot be empty.",
          "Please paste a complete job description with responsibilities and requirements."
        ]
      });
      return;
    }

    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      setAnalysis({
        error: true,
        title: "Invalid Resume",
        message: "Please provide a valid resume.",
        guidance: [
          "The resume field cannot be empty.",
          "Please paste your resume text or upload a resume file."
        ]
      });
      return;
    }

    if (isLowInformationJD(jd)) {
      setAnalysis({
        error: true,
        title: "Insufficient Job Description",
        message:
          "The job description provided is too short to infer real role expectations.",
        guidance: [
          "Paste a fuller job description with responsibilities and requirements.",
          "One-word or very short descriptions don't provide enough context.",
          "RoleAudit avoids generating misleading scores when inputs are vague."
        ]
      });
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const roleProfile = inferRoleFromJD(jd);
        const resumeSignals = extractResumeSignals(resume);
        const scores = scoreDimensions(roleProfile, resumeSignals);
        const baseReadinessScore = scores.baseReadinessScore;
        const riskPenalty = scores.riskPenalty;
        const scoreAfterRisk = Math.max(0, baseReadinessScore - riskPenalty);
        const jdRequiresCoverLetter = jd.toLowerCase().includes("cover letter");
        const coverLetterResult = applyCoverLetterModifier(
          scoreAfterRisk,
          coverLetter,
          roleProfile,
          jdRequiresCoverLetter
        );
        const smoothedScore = applyScoreSmoothing(
          coverLetterResult.adjustedScore,
          roleProfile,
          resumeSignals
        );
        const jdEducationRequirements = extractEducationRequirements(jd);
        const educationFitMultiplier = scoreEducationFit(
          jdEducationRequirements,
          resumeSignals.educationBackground
        );
        const fullTimeMultiplier = scoreFullTimeFit(
          jdEducationRequirements,
          resume
        );
        const finalScore = Math.round(
          smoothedScore * educationFitMultiplier * fullTimeMultiplier
        );
        const clampedFinalScore = Math.max(0, Math.min(100, finalScore));
        const jdEvidence = extractJDEvidence(jd);
        const resumeEvidence = extractResumeEvidence(resume, jdEducationRequirements);
        const finalAnalysis = generateAnalysis(
          jdEvidence,
          resumeEvidence,
          {
            ...scores,
            baseReadinessScore,
            riskPenalty,
            scoreAfterRisk,
            baseScore: clampedFinalScore
          }
        );
        finalAnalysis.coverLetterImpact = coverLetterResult;
        setAnalysis(finalAnalysis);
      } catch (error) {
        console.error("Analysis failed:", error);
        setAnalysis({
          error: true,
          title: "Analysis Error",
          message: "An unexpected error occurred during analysis. Please check your inputs and try again.",
          guidance: [
            "Ensure your job description and resume are valid text inputs.",
            "Avoid extremely long or malformed inputs.",
            "If the issue persists, try a different browser or contact support."
          ]
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 400);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        padding: "var(--space-4) 0",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)"
      }}>
        <div className="container" style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "var(--text-xl)", 
              fontWeight: "var(--font-semibold)",
              color: "var(--text-primary)"
            }}>
              RoleAudit
            </h1>
            <p style={{ 
              margin: "var(--space-1) 0 0", 
              fontSize: "var(--text-sm)", 
              color: "var(--text-tertiary)"
            }}>
              Role Readiness Analysis
            </p>
          </div>
          {analysis && !analysis.error && (
            <button
              onClick={() => setAnalysis(null)}
              className="btn btn-secondary"
            >
              New Analysis
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, padding: "var(--space-8) 0" }}>
        <div className="container">
          {isAnalyzing ? (
            <div className="card" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
              <div style={{ 
                width: "24px", 
                height: "24px", 
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                margin: "0 auto var(--space-6)",
                animation: "spin 0.8s linear infinite"
              }}></div>
              <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
                Analyzing
              </h2>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                Processing your inputs...
              </p>
            </div>
          ) : !analysis ? (
            <InputPage onAnalyze={handleAnalyze} />
          ) : (
            <ResultsPage analysis={analysis} onReset={() => setAnalysis(null)} />
          )}
        </div>
      </main>

      <footer style={{ 
        padding: "var(--space-6) 0", 
        borderTop: "1px solid var(--border)", 
        background: "var(--bg-secondary)"
      }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ 
            margin: 0, 
            fontSize: "var(--text-sm)", 
            color: "var(--text-tertiary)"
          }}>
            RoleAudit © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
