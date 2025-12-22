import { useState } from "react";
import { trimQuote } from "../utils/trimQuote";
import { downloadAnalysis, copyAnalysisToClipboard } from "../utils/exportAnalysis";

function DimensionCard({ title, dimension, score, maxScore }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div style={{
      marginBottom: "var(--space-4)",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow: "hidden"
    }}>
      <div 
        style={{ 
          padding: "var(--space-5)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isExpanded ? "var(--bg-primary)" : "var(--bg-card)"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
            <strong style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
              {title}
            </strong>
            <span style={{ 
              padding: "var(--space-1) var(--space-2)", 
              borderRadius: "4px", 
              background: "var(--bg-primary)",
              color: getScoreColor(score),
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-medium)"
            }}>
              {score} / {maxScore}
            </span>
            <span className="badge badge-neutral">
              {dimension.conceptualGroup}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {dimension.description}
          </p>
        </div>
        <div style={{
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          fontSize: "var(--text-sm)"
        }}>
          {isExpanded ? "−" : "+"}
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ 
          padding: "var(--space-5)", 
          background: "var(--bg-primary)",
          borderTop: "1px solid var(--border)"
        }}>
          {dimension.microFactors && dimension.microFactors.length > 0 && (
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h5 style={{ 
                fontSize: "var(--text-sm)", 
                fontWeight: "var(--font-semibold)",
                color: "var(--text-primary)",
                margin: "0 0 var(--space-3) 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Key Factors
              </h5>
              <ul style={{ margin: 0, paddingLeft: "var(--space-5)", listStyle: "none" }}>
                {dimension.microFactors.map((factor, i) => (
                  <li key={i} style={{ 
                    marginBottom: "var(--space-2)", 
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    lineHeight: "1.6"
                  }}>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dimension.whatHelped && dimension.whatHelped.length > 0 && (
            <div style={{ 
              marginBottom: "var(--space-6)", 
              padding: "var(--space-4)", 
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "var(--radius-sm)"
            }}>
              <h5 style={{ 
                fontSize: "var(--text-sm)", 
                fontWeight: "var(--font-semibold)",
                color: "var(--success)",
                margin: "0 0 var(--space-3) 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                What Helped
              </h5>
              {dimension.whatHelped.map((item, i) => (
                <div key={i} style={{ marginTop: i > 0 ? "var(--space-4)" : "0" }}>
                  <div style={{ fontWeight: "var(--font-medium)", marginBottom: "var(--space-2)", color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>
                    {item.factor}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-3)", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {item.reason}
                  </div>
                  {item.jdEvidence && item.jdEvidence.length > 0 && (
                    <div className="evidence">
                      <span className="evidence-label">JD:</span>
                      {item.jdEvidence.map((e, j) => (
                        <div key={j} style={{ marginTop: "var(--space-1)" }}>
                          "{trimQuote(e)}"
                        </div>
                      ))}
                    </div>
                  )}
                  {item.resumeEvidence && item.resumeEvidence.length > 0 && (
                    <div className="evidence" style={{ marginTop: "var(--space-2)" }}>
                      <span className="evidence-label">Resume:</span>
                      {item.resumeEvidence.map((e, j) => (
                        <div key={j} style={{ marginTop: "var(--space-1)" }}>
                          "{trimQuote(e)}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {dimension.whatLimited && dimension.whatLimited.length > 0 && (
            <div style={{ 
              padding: "var(--space-4)", 
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "var(--radius-sm)"
            }}>
              <h5 style={{ 
                fontSize: "var(--text-sm)", 
                fontWeight: "var(--font-semibold)",
                color: "var(--warning)",
                margin: "0 0 var(--space-3) 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                What Limited
              </h5>
              {dimension.whatLimited.map((item, i) => (
                <div key={i} style={{ marginTop: i > 0 ? "var(--space-4)" : "0" }}>
                  <div style={{ fontWeight: "var(--font-medium)", marginBottom: "var(--space-2)", color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>
                    {item.factor}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-3)", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    {item.reason}
                  </div>
                  {item.jdEvidence && item.jdEvidence.length > 0 && (
                    <div className="evidence">
                      <span className="evidence-label">JD:</span>
                      {item.jdEvidence.map((e, j) => (
                        <div key={j} style={{ marginTop: "var(--space-1)" }}>
                          "{trimQuote(e)}"
                        </div>
                      ))}
                    </div>
                  )}
                  {item.resumeEvidence && item.resumeEvidence.length > 0 && (
                    <div className="evidence" style={{ marginTop: "var(--space-2)" }}>
                      <span className="evidence-label">Resume:</span>
                      {item.resumeEvidence.map((e, j) => (
                        <div key={j} style={{ marginTop: "var(--space-1)" }}>
                          "{trimQuote(e)}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultsPage({ analysis, onReset }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopy = async () => {
    const success = await copyAnalysisToClipboard(analysis);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadAnalysis(analysis);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const getScoreColorClass = (score) => {
    if (score >= 70) return "score-good";
    if (score >= 40) return "score-moderate";
    return "score-low";
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--success)";
    if (score >= 40) return "var(--warning)";
    return "var(--danger)";
  };

     if (analysis.error) {
    return (
      <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={{ margin: "0 0 var(--space-3)", color: "var(--text-primary)" }}>
            {analysis.title}
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {analysis.message}
          </p>
        </div>

        <div style={{
          padding: "var(--space-5)",
          background: "var(--bg-primary)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--space-6)",
          border: "1px solid var(--border)"
        }}>
          <h3 style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
            What to do:
          </h3>
          <ul style={{ margin: 0, paddingLeft: "var(--space-5)", color: "var(--text-secondary)", lineHeight: "1.8" }}>
          {analysis.guidance.map((item, i) => (
              <li key={i} style={{ marginBottom: "var(--space-2)" }}>
                {item}
              </li>
          ))}
        </ul>
        </div>

        <button onClick={onReset} className="btn btn-primary" style={{ width: "100%" }}>
          Try Again
        </button>
      </div>
    );
  }

  const score = analysis.scoreExplanation?.overallExplanation?.score || analysis.score;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Overall Readiness - Visually Dominant */}
      {analysis.scoreExplanation && analysis.scoreExplanation.overallExplanation && (
        <div className="card" style={{ marginBottom: "var(--space-8)", textAlign: "center" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h1 style={{ 
              margin: "0 0 var(--space-2)", 
              fontSize: "var(--text-4xl)", 
              fontWeight: "var(--font-bold)",
              color: getScoreColor(score),
              letterSpacing: "-0.02em"
            }}>
              Overall Readiness: {score} / 100
            </h1>
            <p style={{ 
              margin: "var(--space-2) 0 0", 
              fontSize: "var(--text-lg)", 
              color: "var(--text-secondary)",
              fontWeight: "var(--font-medium)"
            }}>
              {analysis.band}
            </p>
          </div>
          
          <p style={{ 
            margin: "0 0 var(--space-6)", 
            fontSize: "var(--text-base)", 
            color: "var(--text-secondary)",
            lineHeight: "1.7",
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            {analysis.scoreExplanation.overallExplanation.context}
          </p>
          
          <div style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            <button
              onClick={handleDownload}
              className="btn btn-secondary"
            >
              {downloadSuccess ? "Downloaded" : "Download Report"}
            </button>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
            >
              {copySuccess ? "Copied" : "Copy Analysis"}
            </button>
          </div>

          <details style={{ marginTop: "var(--space-8)", textAlign: "left" }}>
            <summary style={{ 
              cursor: "pointer", 
              fontWeight: "var(--font-medium)", 
              color: "var(--text-secondary)", 
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Score Breakdown
            </summary>
            <div style={{ 
              marginTop: "var(--space-4)", 
              padding: "var(--space-5)", 
              background: "var(--bg-primary)", 
              borderRadius: "var(--radius-sm)", 
              border: "1px solid var(--border)"
            }}>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Base Readiness:</strong>
                  <span style={{ color: getScoreColor(analysis.scoreExplanation.baseReadinessScore), fontWeight: "var(--font-semibold)" }}>
                    {analysis.scoreExplanation.baseReadinessScore}/100
                  </span>
                </div>
                <div style={{ 
                  fontSize: "var(--text-xs)", 
                  color: "var(--text-tertiary)", 
                  marginLeft: "var(--space-4)",
                  padding: "var(--space-2)",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  lineHeight: "1.8"
                }}>
                  Role Alignment: <span style={{ color: getScoreColor((analysis.scoreExplanation.dimensionBreakdown.relevance.score / analysis.scoreExplanation.dimensionBreakdown.relevance.maxScore) * 100) }}>{analysis.scoreExplanation.dimensionBreakdown.relevance.score}</span> + 
                  Skill Realism: <span style={{ color: getScoreColor((analysis.scoreExplanation.dimensionBreakdown.depth.score / analysis.scoreExplanation.dimensionBreakdown.depth.maxScore) * 100) }}>{analysis.scoreExplanation.dimensionBreakdown.depth.score}</span> + 
                  Adaptability: <span style={{ color: getScoreColor((analysis.scoreExplanation.dimensionBreakdown.adaptability.score / analysis.scoreExplanation.dimensionBreakdown.adaptability.maxScore) * 100) }}>{analysis.scoreExplanation.dimensionBreakdown.adaptability.score}</span> + 
                  Context Fit: <span style={{ color: getScoreColor((analysis.scoreExplanation.dimensionBreakdown.environmentFit.score / analysis.scoreExplanation.dimensionBreakdown.environmentFit.maxScore) * 100) }}>{analysis.scoreExplanation.dimensionBreakdown.environmentFit.score}</span>
                </div>
              </div>
              
              {analysis.scoreExplanation.riskPenalty > 0 ? (
                <div style={{ 
                  marginBottom: "var(--space-4)", 
                  padding: "var(--space-3)", 
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Risk Deduction:</strong>
                    <span style={{ color: "var(--danger)", fontWeight: "var(--font-semibold)" }}>
                      -{analysis.scoreExplanation.riskPenalty} points
                    </span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    ({analysis.scoreExplanation.riskPenalty / 3} risk flag(s) × 3 points each)
                  </div>
                </div>
              ) : (
                <div style={{ 
                  marginBottom: "var(--space-4)", 
                  fontSize: "var(--text-xs)", 
                  color: "var(--text-tertiary)"
                }}>
                  No risk deductions applied.
                </div>
              )}
              
              <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}>Score After Risk Deduction:</strong>
                  <span style={{ color: getScoreColor(analysis.scoreExplanation.scoreAfterRisk), fontWeight: "var(--font-semibold)" }}>
                    {analysis.scoreExplanation.scoreAfterRisk} / 100
                  </span>
                </div>
              </div>
              
              {analysis.scoreExplanation.overallExplanation.score !== analysis.scoreExplanation.scoreAfterRisk && (
                <div style={{ 
                  marginTop: "var(--space-4)", 
                  paddingTop: "var(--space-4)", 
                  borderTop: "1px solid var(--border)", 
                  fontSize: "var(--text-xs)", 
                  color: "var(--text-tertiary)" 
                }}>
                  Additional adjustments (cover letter impact, score smoothing, and education/full-time fit multipliers) applied to reach the final score.
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Dimension Breakdown */}
      {analysis.scoreExplanation && analysis.scoreExplanation.dimensionBreakdown && (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ 
              margin: "0 0 var(--space-2)", 
              color: "var(--text-primary)"
            }}>
              Score Calculation
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              The score is built from four core dimensions. Each dimension is explained below with evidence from the JD and your resume.
            </p>
          </div>
          
          {Object.entries(analysis.scoreExplanation.dimensionBreakdown).map(([dimensionKey, dimension]) => {
            if (dimensionKey === "riskPenalty") {
              return null;
            }
            
            const dimensionTitles = {
              relevance: "Role Alignment",
              depth: "Skill Realism",
              adaptability: "Adaptability",
              environmentFit: "Context Fit"
            };
            
            return (
              <DimensionCard
                key={dimensionKey}
                title={dimensionTitles[dimensionKey] || dimensionKey.charAt(0).toUpperCase() + dimensionKey.slice(1)}
                dimension={dimension}
                score={dimension.score}
                maxScore={dimension.maxScore}
              />
            );
          })}
        </div>
      )}

      {/* Role Requirements */}
      {analysis.roleSummary && analysis.roleSummary.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
              Role Requirements
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              Each requirement is backed by specific text from the job description.
            </p>
          </div>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {analysis.roleSummary.map((item, i) => (
              <div key={i} style={{
                padding: "var(--space-5)",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)"
              }}>
                <div style={{ 
                  fontWeight: "var(--font-semibold)", 
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-base)"
                }}>
                  {item.dimension}: {item.claim}
                </div>
                {item.evidence && item.evidence.length > 0 && (
                  <div className="evidence">
                    <span className="evidence-label">Evidence from JD</span>
                    {item.evidence.map((evidence, j) => (
                      <div key={j} style={{ marginTop: "var(--space-1)" }}>
                        "{trimQuote(evidence)}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pairings */}
      {analysis.pairings && analysis.pairings.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
              Resume Alignment
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              Each dimension shows JD expectations paired with your resume evidence.
            </p>
          </div>
          <div style={{ display: "grid", gap: "var(--space-6)" }}>
            {analysis.pairings.map((pairing, i) => {
              const badgeClass = pairing.classification === "match" ? "badge-success" : 
                                pairing.classification === "gap" ? "badge-danger" : 
                                pairing.classification === "risk" ? "badge-danger" : "badge-neutral";

              return (
                <div key={i} style={{
                  padding: "var(--space-6)",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "var(--space-3)",
                    marginBottom: "var(--space-5)",
                    flexWrap: "wrap"
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: "var(--text-lg)", 
                      fontWeight: "var(--font-semibold)",
                      color: "var(--text-primary)"
                    }}>
                      {pairing.dimension}
                    </h3>
                    <span className={`badge ${badgeClass}`}>
                      {pairing.classification}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: "var(--space-5)" }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)", display: "block", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      JD Expectation:
                    </strong>
                    <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "1.6", marginBottom: "var(--space-3)" }}>
                      {pairing.jdExpectation.inference}
                    </div>
                    {pairing.jdExpectation.evidence && pairing.jdExpectation.evidence.length > 0 && (
                      <div className="evidence">
                        {pairing.jdExpectation.evidence.map((evidence, j) => (
                          <div key={j} style={{ marginTop: "var(--space-1)" }}>
                            "{trimQuote(evidence)}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "var(--space-5)" }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)", display: "block", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Your Resume:
                    </strong>
                    <div style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: "1.6", marginBottom: "var(--space-3)" }}>
                      {pairing.resumeEvidence.inference}
                    </div>
                    {pairing.resumeEvidence.evidence && pairing.resumeEvidence.evidence.length > 0 && (
                      <div className="evidence">
                        {pairing.resumeEvidence.evidence.map((evidence, j) => (
                          <div key={j} style={{ marginTop: "var(--space-1)" }}>
                            "{trimQuote(evidence)}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    fontSize: "var(--text-sm)", 
                    color: "var(--text-tertiary)", 
                    fontStyle: "italic",
                    padding: "var(--space-4)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    lineHeight: "1.6"
                  }}>
                    {pairing.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
              Strengths
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              Areas where your resume aligns with JD requirements.
            </p>
          </div>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {analysis.strengths.map((strength, i) => (
              <div key={i} className="strength-card" style={{
                padding: "var(--space-5)",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "var(--radius-sm)"
              }}>
                <div style={{ 
                  fontWeight: "var(--font-semibold)", 
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-base)"
                }}>
                  {strength.dimension}
                </div>
                <div style={{ 
                  marginBottom: "var(--space-4)",
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-sm)",
                  lineHeight: "1.6"
                }}>
                  {strength.explanation}
                </div>
                {strength.resumeEvidence && strength.resumeEvidence.length > 0 && (
                  <div className="evidence">
                    <span className="evidence-label">Evidence from your resume</span>
                    {strength.resumeEvidence.map((evidence, j) => (
                      <div key={j} style={{ marginTop: "var(--space-1)" }}>
                        "{trimQuote(evidence)}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {analysis.gaps && analysis.gaps.length > 0 && (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
              Gaps to Address
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              Areas where JD requirements don't match your resume evidence.
            </p>
          </div>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {analysis.gaps.map((gap, i) => (
              <div key={i} className="gap-card" style={{
                padding: "var(--space-5)",
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--radius-sm)"
              }}>
                <div style={{ 
                  fontWeight: "var(--font-semibold)", 
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-base)"
                }}>
                  {gap.dimension}
                </div>
                <div style={{ 
                  marginBottom: "var(--space-4)",
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-sm)",
                  lineHeight: "1.6"
                }}>
                  {gap.explanation}
                </div>
                <div style={{ marginTop: "var(--space-4)", fontSize: "var(--text-sm)" }}>
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "var(--text-xs)" }}>JD expects:</strong>
                    <div style={{ color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                      {gap.jdExpectation.inference}
                    </div>
                    {gap.jdExpectation.evidence && gap.jdExpectation.evidence.length > 0 && (
                      <div className="evidence">
                        {gap.jdExpectation.evidence.map((evidence, j) => (
                          <div key={j} style={{ marginTop: "var(--space-1)" }}>
                            "{trimQuote(evidence)}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "var(--text-xs)" }}>Your resume shows:</strong>
                    <div style={{ color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
                      {gap.resumeEvidence.inference}
                    </div>
                    {gap.resumeEvidence.evidence && gap.resumeEvidence.evidence.length > 0 && (
                      <div className="evidence">
                        {gap.resumeEvidence.evidence.map((evidence, j) => (
                          <div key={j} style={{ marginTop: "var(--space-1)" }}>
                            "{trimQuote(evidence)}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 ? (
        <div className="card" style={{ 
          marginBottom: "var(--space-8)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.05)"
        }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ margin: "0 0 var(--space-2)", color: "var(--text-primary)" }}>
              Potential Risks
            </h2>
            <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
              Areas that may require attention or clarification.
            </p>
          </div>
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {analysis.risks.map((risk, i) => (
              <div key={i} style={{
                padding: "var(--space-5)",
                background: "var(--bg-primary)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--radius-sm)"
              }}>
                <div style={{ 
                  fontWeight: "var(--font-semibold)", 
                  marginBottom: "var(--space-3)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-base)"
                }}>
                  {risk.dimension}
                </div>
                <div style={{ 
                  marginBottom: "var(--space-4)",
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-sm)",
                  lineHeight: "1.6"
                }}>
                  {risk.explanation}
                </div>
                {risk.evidence && risk.evidence.length > 0 && (
                  <div className="evidence">
                    <span className="evidence-label">Evidence</span>
                    {risk.evidence.map((evidence, j) => (
                      <div key={j} style={{ marginTop: "var(--space-1)" }}>
                        "{trimQuote(evidence)}"
                      </div>
                    ))}
                  </div>
                )}
                {risk.detail && (
                  <div style={{ 
                    marginTop: "var(--space-4)", 
                    fontSize: "var(--text-sm)", 
                    color: "var(--text-tertiary)",
                    padding: "var(--space-3)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)"
                  }}>
                    {risk.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ 
          marginBottom: "var(--space-8)", 
          padding: "var(--space-5)", 
          fontSize: "var(--text-sm)", 
          color: "var(--text-tertiary)",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          textAlign: "center",
          fontStyle: "italic"
        }}>
          No major red flags detected.
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "var(--space-8)" }}>
        <button 
          onClick={onReset} 
          className="btn btn-primary"
          style={{ minWidth: "200px" }}
        >
          Analyze Another Role
      </button>
      </div>
    </div>
  );
}

export default ResultsPage;
