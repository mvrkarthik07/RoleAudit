import { pairJDWithResume } from "./pairJDWithResume";

/**
 * Generates evidence-based analysis
 * Every claim must be backed by specific JD or resume text
 */
export function generateAnalysis(jdEvidence, resumeEvidence, scores) {
  // Generate pairings: JD expectations vs resume evidence
  const pairings = pairJDWithResume(jdEvidence, resumeEvidence);

  // Build evidence-based role summary
  const roleSummary = buildEvidenceBasedRoleSummary(jdEvidence);

  // Build evidence-based strengths (matches)
  const strengths = buildEvidenceBasedStrengths(pairings);

  // Build evidence-based gaps and risks
  const gaps = buildEvidenceBasedGaps(pairings);
  const risks = buildEvidenceBasedRisks(pairings, resumeEvidence);

  // Build comprehensive score explanation with dimension breakdowns
  const scoreExplanation = buildComprehensiveScoreExplanation(
    scores, 
    jdEvidence, 
    resumeEvidence, 
    pairings
  );

  return {
    score: scores.baseScore,
    band: inferBand(scores.baseScore),
    roleSummary,
    strengths,
    gaps,
    risks,
    pairings, // Full pairings for detailed view
    scoreExplanation
  };
}

function inferBand(score) {
  if (score >= 75) return "Strong readiness";
  if (score >= 60) return "Viable with gaps";
  if (score >= 45) return "High ramp-up risk";
  return "Likely mismatch";
}

function buildEvidenceBasedRoleSummary(jdEvidence) {
  const summary = [];

  // Execution Style
  if (jdEvidence.executionStyle.inference === "execution-heavy") {
    summary.push({
      claim: "This role emphasizes hands-on execution and delivery",
      evidence: jdEvidence.executionStyle.evidence.executionTriggers.slice(0, 3),
      dimension: "Execution Style"
    });
  }

  // Learning Curve
  if (jdEvidence.learningCurve.inference === "steep") {
    summary.push({
      claim: "The role expects rapid learning and adaptation",
      evidence: jdEvidence.learningCurve.evidence.steepTriggers.slice(0, 3),
      dimension: "Learning Curve"
    });
  }

  // Collaboration
  if (jdEvidence.collaboration.inference !== "low") {
    summary.push({
      claim: `Collaboration is ${jdEvidence.collaboration.inference} priority`,
      evidence: jdEvidence.collaboration.evidence.triggers.slice(0, 3),
      dimension: "Collaboration"
    });
  }

  // Structure Level
  if (jdEvidence.structureLevel.inference === "ambiguous") {
    summary.push({
      claim: "Work is loosely defined and requires self-direction",
      evidence: jdEvidence.structureLevel.evidence.ambiguousTriggers.slice(0, 3),
      dimension: "Structure Level"
    });
  }

  // Education
  if (jdEvidence.education.requirements && jdEvidence.education.requirements.length > 0) {
    summary.push({
      claim: `Education requirements: ${jdEvidence.education.requirements.join(", ")}`,
      evidence: jdEvidence.education.evidence.slice(0, 2),
      dimension: "Education"
    });
  } else if (jdEvidence.education.openToAll) {
    summary.push({
      claim: "Open to all majors",
      evidence: jdEvidence.education.evidence.slice(0, 2),
      dimension: "Education"
    });
  }

  return summary;
}

function buildEvidenceBasedStrengths(pairings) {
  return pairings
    .filter(p => p.classification === "match" || p.classification === "strength")
    .map(p => ({
      dimension: p.dimension,
      explanation: p.explanation,
      jdEvidence: p.jdExpectation.evidence,
      resumeEvidence: p.resumeEvidence.evidence
    }));
}

function buildEvidenceBasedGaps(pairings) {
  return pairings
    .filter(p => p.classification === "gap")
    .map(p => ({
      dimension: p.dimension,
      explanation: p.explanation,
      jdExpectation: {
        inference: p.jdExpectation.inference,
        evidence: p.jdExpectation.evidence
      },
      resumeEvidence: {
        inference: p.resumeEvidence.inference,
        evidence: p.resumeEvidence.evidence
      }
    }));
}

function buildEvidenceBasedRisks(pairings, resumeEvidence) {
  const risks = [];

  // Risks from pairings
  pairings
    .filter(p => p.classification === "risk")
    .forEach(p => {
      risks.push({
        dimension: p.dimension,
        explanation: p.explanation,
        jdExpectation: {
          inference: p.jdExpectation.inference,
          evidence: p.jdExpectation.evidence
        },
        resumeEvidence: {
          inference: p.resumeEvidence.inference,
          evidence: p.resumeEvidence.evidence
        }
      });
    });

  // Risks from resume evidence
  if (resumeEvidence.riskFlags && resumeEvidence.riskFlags.evidence) {
    resumeEvidence.riskFlags.evidence.forEach(risk => {
      risks.push({
        dimension: "General Risk",
        explanation: risk.risk,
        evidence: risk.snippets || [],
        detail: risk.explanation
      });
    });
  }

  return risks;
}

function buildComprehensiveScoreExplanation(scores, jdEvidence, resumeEvidence, pairings) {
  const explanation = {
    overallScore: scores.baseScore,
    baseReadinessScore: scores.baseReadinessScore || (scores.relevance + scores.depth + scores.adaptability + scores.environmentFit),
    riskPenalty: scores.riskPenalty || 0,
    scoreAfterRisk: scores.scoreAfterRisk || (scores.baseReadinessScore - (scores.riskPenalty || 0)),
    overallExplanation: buildOverallScoreExplanation(
      scores.baseScore,
      scores.baseReadinessScore || (scores.relevance + scores.depth + scores.adaptability + scores.environmentFit),
      scores.riskPenalty || 0
    ),
    dimensionBreakdown: {
      relevance: buildRelevanceExplanation(scores.relevance, jdEvidence, resumeEvidence, pairings),
      depth: buildDepthExplanation(scores.depth, resumeEvidence),
      adaptability: buildAdaptabilityExplanation(scores.adaptability, jdEvidence, resumeEvidence, pairings),
      environmentFit: buildEnvironmentFitExplanation(scores.environmentFit, jdEvidence, resumeEvidence, pairings),
      riskPenalty: buildRiskPenaltyExplanation(scores.riskPenalty || 0, resumeEvidence)
    },
    eligibilityFactors: buildEligibilityFactors(scores)
  };

  return explanation;
}

function buildOverallScoreExplanation(finalScore, baseReadinessScore, riskPenalty) {
  let context = "";
  if (finalScore >= 75) {
    context = "This score indicates strong alignment across multiple dimensions. Strong intern profiles typically fall in the 60-80 range, so this is above average.";
  } else if (finalScore >= 60) {
    context = "This score indicates viable readiness with some gaps. Strong intern profiles typically fall in the 60-80 range, so this is within the expected range.";
  } else if (finalScore >= 45) {
    context = "This score indicates higher ramp-up risk. Strong intern profiles typically fall in the 60-80 range, so this suggests areas that may need attention.";
  } else {
    context = "This score indicates significant gaps. Strong intern profiles typically fall in the 60-80 range, so this suggests substantial misalignment.";
  }

  const scoreAfterRisk = baseReadinessScore - riskPenalty;

  return {
    score: finalScore,
    baseReadinessScore,
    riskPenalty,
    scoreAfterRisk,
    explanation: `The overall readiness score is ${finalScore} out of 100.`,
    breakdown: `Base readiness: ${baseReadinessScore}/100 (sum of 4 dimensions)${riskPenalty > 0 ? ` - Risk deduction: ${riskPenalty} = ${scoreAfterRisk}/100` : ''}. Additional adjustments (cover letter, smoothing, education/full-time fit) result in the final score.`,
    context,
    composition: "The base score (100 points max) combines: Role Alignment (25 points), Skill Realism (25 points), Adaptability (25 points), and Context Fit (25 points). Risk deductions are applied separately when risks exist."
  };
}

function buildRelevanceExplanation(score, jdEvidence, resumeEvidence, pairings) {
  const explanation = {
    score,
    maxScore: 25,
    conceptualGroup: "Role Alignment",
    description: "Measures how well your experience aligns with the role's core expectations (execution style and learning curve).",
    whatHelped: [],
    whatLimited: [],
    microFactors: []
  };

  // Check execution style alignment
  const executionPairing = pairings.find(p => p.dimension === "Execution & Delivery");
  if (executionPairing) {
    if (executionPairing.classification === "match") {
      explanation.whatHelped.push({
        factor: "Execution alignment was strong",
        reason: "JD emphasizes execution, and your resume shows strong action evidence",
        jdEvidence: executionPairing.jdExpectation.evidence.slice(0, 2),
        resumeEvidence: executionPairing.resumeEvidence.evidence.slice(0, 2)
      });
      explanation.microFactors.push("Strong execution alignment: JD emphasizes hands-on delivery, resume shows multiple action verbs");
    } else if (executionPairing.classification === "gap") {
      explanation.whatLimited.push({
        factor: "Execution alignment was limited",
        reason: "JD emphasizes execution, but your resume shows limited action evidence",
        jdEvidence: executionPairing.jdExpectation.evidence.slice(0, 2),
        resumeEvidence: executionPairing.resumeEvidence.evidence.slice(0, 2)
      });
      explanation.microFactors.push("Limited execution alignment: JD emphasizes hands-on delivery, resume shows fewer action verbs");
    }
  }

  // Check learning curve alignment
  const learningPairing = pairings.find(p => p.dimension === "Learning & Adaptation");
  if (learningPairing) {
    if (learningPairing.classification === "match") {
      explanation.whatHelped.push({
        factor: "Learning curve alignment was strong",
        reason: "JD expects rapid learning, and your resume shows adaptability evidence",
        jdEvidence: learningPairing.jdExpectation.evidence.slice(0, 2),
        resumeEvidence: learningPairing.resumeEvidence.evidence.slice(0, 2)
      });
      explanation.microFactors.push("Strong learning curve alignment: JD expects rapid adaptation, resume shows adaptability signals");
    } else if (learningPairing.classification === "risk") {
      explanation.whatLimited.push({
        factor: "Learning curve alignment was limited",
        reason: "JD expects rapid learning, but your resume shows limited adaptability evidence",
        jdEvidence: learningPairing.jdExpectation.evidence.slice(0, 2),
        resumeEvidence: learningPairing.resumeEvidence.evidence.slice(0, 2)
      });
      explanation.microFactors.push("Limited learning curve alignment: JD expects rapid adaptation, resume shows fewer adaptability signals");
    }
  }

  // Score-based explanation
  if (score >= 15) {
    explanation.microFactors.push("High score: strong alignment across execution style and learning curve");
  } else if (score >= 10) {
    explanation.microFactors.push("Moderate score: alignment present but not strong across both dimensions");
  } else {
    explanation.microFactors.push("Lower score: limited alignment in one or both key dimensions");
  }

  return explanation;
}

function buildDepthExplanation(score, resumeEvidence) {
  const explanation = {
    score,
    maxScore: 25,
    conceptualGroup: "Skill Realism",
    description: "Measures the depth and repeated usage of technical skills in your resume.",
    whatHelped: [],
    whatLimited: [],
    microFactors: []
  };

  const skillDepth = resumeEvidence.skillDepth;
  
  if (skillDepth.inference === "strong") {
    explanation.whatHelped.push({
      factor: "Skill depth was strong",
      reason: "Your resume shows repeated, contextual usage of multiple technical skills",
      resumeEvidence: [
        ...skillDepth.evidence.sectionSnippets.slice(0, 2),
        ...skillDepth.evidence.skillSnippets.slice(0, 2)
      ]
    });
      explanation.microFactors.push(`Strong skill depth: ${skillDepth.evidence.repeatedSkills} skill(s) mentioned 2+ times across multiple projects`);
  } else if (skillDepth.inference === "moderate") {
    explanation.whatHelped.push({
      factor: "Skill depth was moderate",
      reason: "Your resume shows some repeated skill usage",
      resumeEvidence: skillDepth.evidence.skillSnippets.slice(0, 2)
    });
    explanation.microFactors.push("Moderate skill depth: some skills mentioned multiple times, but depth signals are limited");
  } else {
    explanation.whatLimited.push({
      factor: "Skill depth was limited",
      reason: "Your resume shows limited repeated usage of technical skills",
      resumeEvidence: []
    });
    explanation.microFactors.push("Limited skill depth: technical skills appear infrequently, suggesting surface-level exposure");
  }

  return explanation;
}

function buildAdaptabilityExplanation(score, jdEvidence, resumeEvidence, pairings) {
  const explanation = {
    score,
    maxScore: 25,
    conceptualGroup: "Adaptability",
    description: "Measures your ability to learn quickly and adapt, especially important if the role has a steep learning curve.",
    whatHelped: [],
    whatLimited: [],
    microFactors: []
  };

  const adaptability = resumeEvidence.adaptability;
  const learningPairing = pairings.find(p => p.dimension === "Learning & Adaptation");

  if (adaptability.inference === "strong") {
    explanation.whatHelped.push({
      factor: "Adaptability signals were strong",
      reason: "Your resume shows multiple explicit and implicit learning/adaptation signals",
      resumeEvidence: [
        ...adaptability.evidence.explicitSnippets.slice(0, 2),
        ...adaptability.evidence.implicitSnippets.slice(0, 2)
      ]
    });
    explanation.microFactors.push("Strong adaptability: resume shows multiple learning signals (learned, self-taught, explored, adapted)");
  } else if (adaptability.inference === "moderate") {
    explanation.whatHelped.push({
      factor: "Adaptability signals were moderate",
      reason: "Your resume shows some learning/adaptation signals",
      resumeEvidence: adaptability.evidence.explicitSnippets.slice(0, 2)
    });
    explanation.microFactors.push("Moderate adaptability: some learning signals present, but not consistently");
  } else {
    explanation.whatLimited.push({
      factor: "Adaptability signals were limited",
      reason: "Your resume shows few explicit learning/adaptation signals",
      resumeEvidence: []
    });
    explanation.microFactors.push("Limited adaptability: resume shows few learning/adaptation signals");
  }

  // Check if steep learning curve penalty applies
  if (jdEvidence.learningCurve.inference === "steep" && adaptability.inference === "weak") {
    explanation.whatLimited.push({
      factor: "Steep learning curve penalty applied",
      reason: "JD expects rapid learning, but your resume shows limited adaptability evidence",
      jdEvidence: jdEvidence.learningCurve.evidence.steepTriggers.slice(0, 2),
      resumeEvidence: []
    });
    explanation.microFactors.push("Score reduced: JD emphasizes steep learning curve, resume shows limited adaptability");
  }

  return explanation;
}

function buildEnvironmentFitExplanation(score, jdEvidence, resumeEvidence, pairings) {
  const explanation = {
    score,
    maxScore: 25,
    conceptualGroup: "Context Fit",
    description: "Measures your exposure to production/real-world environments, especially important for execution-heavy roles.",
    whatHelped: [],
    whatLimited: [],
    microFactors: []
  };

  const environmentPairing = pairings.find(p => p.dimension === "Production Experience");
  const environments = resumeEvidence.environmentExposure;

  if (environments.environments.includes("production")) {
    explanation.whatHelped.push({
      factor: "Production exposure was present",
      reason: "Your resume shows production/deployment experience",
      resumeEvidence: environments.evidence.production.slice(0, 3)
    });
    explanation.microFactors.push("Strong context fit: resume shows production/deployment experience");
    
    if (jdEvidence.executionStyle.inference === "execution-heavy") {
      explanation.microFactors.push("Especially valuable: JD emphasizes execution-heavy work");
    }
  } else {
    explanation.whatLimited.push({
      factor: "Production exposure was limited",
      reason: "Your resume shows limited production/deployment experience",
      resumeEvidence: []
    });
    explanation.microFactors.push("Limited context fit: resume shows no production/deployment experience");
    
    if (jdEvidence.executionStyle.inference === "execution-heavy") {
      explanation.whatLimited.push({
        factor: "Execution-heavy role penalty",
        reason: "JD emphasizes execution, but your resume lacks production exposure",
        jdEvidence: jdEvidence.executionStyle.evidence.executionTriggers.slice(0, 2),
        resumeEvidence: []
      });
      explanation.microFactors.push("Score reduced: JD emphasizes execution-heavy work, resume lacks production exposure");
    }
  }

  // Check academic vs ambiguous structure mismatch
  if (environments.environments.includes("academic") && 
      jdEvidence.structureLevel.inference === "ambiguous") {
    explanation.whatLimited.push({
      factor: "Academic vs ambiguous structure mismatch",
      reason: "JD requires self-direction, but your resume shows primarily academic experience",
      jdEvidence: jdEvidence.structureLevel.evidence.ambiguousTriggers.slice(0, 2),
      resumeEvidence: environments.evidence.academic.slice(0, 2)
    });
    explanation.microFactors.push("Score reduced: JD emphasizes self-directed work, resume shows primarily academic experience");
  }

  return explanation;
}

function buildRiskPenaltyExplanation(penalty, resumeEvidence) {
  const explanation = {
    penalty,
    maxPenalty: 15,
    conceptualGroup: "Constraints & Eligibility",
    description: "Penalties applied for risk flags detected in your resume.",
    whatHelped: [],
    whatLimited: [],
    microFactors: []
  };

  if (penalty === 0) {
    explanation.whatHelped.push({
      factor: "No risk flags detected",
      reason: "Your resume does not show major risk indicators",
      resumeEvidence: []
    });
    explanation.microFactors.push("No risk penalty applied because no major risk flags were detected");
  } else {
    const riskFlags = resumeEvidence.riskFlags;
    if (riskFlags && riskFlags.evidence) {
      riskFlags.evidence.forEach(risk => {
        explanation.whatLimited.push({
          factor: risk.risk,
          reason: risk.explanation || risk.detail,
          resumeEvidence: risk.snippets || []
        });
        explanation.microFactors.push(`Risk penalty applied: ${risk.risk}`);
      });
    }
    explanation.microFactors.push(`Total risk penalty: -${penalty} points (${penalty / 3} risk flag(s) × 3 points each)`);
  }

  return explanation;
}

function buildEligibilityFactors(scores) {
  // Note: Education and full-time multipliers are applied to the final score
  // but we don't have direct access to them here. They're handled in App.jsx.
  // This function can be expanded if we pass those multipliers through.
  return {
    description: "Education fit and full-time constraints are applied as multipliers to the final score.",
    note: "These factors adjust the base score but don't appear as separate dimension scores."
  };
}
