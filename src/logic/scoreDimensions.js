/**
 * Scores dimensions with exactly 100 points allocated across 4 dimensions:
 * - Role Alignment (relevance): 25 points
 * - Skill Realism (depth): 25 points
 * - Adaptability: 25 points
 * - Eligibility & Fit (environmentFit): 25 points
 * 
 * Risk penalties are calculated separately and applied as deductions.
 */
export function scoreDimensions(roleProfile, resumeSignals) {
  // Edge case: invalid inputs
  if (!roleProfile || !resumeSignals) {
    return {
      relevance: 0,
      depth: 0,
      adaptability: 0,
      environmentFit: 0,
      riskPenalty: 0,
      baseReadinessScore: 0
    };
  }

  const relevance = scoreRelevance(roleProfile, resumeSignals);
  const depth = scoreDepth(resumeSignals);
  const adaptability = scoreAdaptability(roleProfile, resumeSignals);
  const environmentFit = scoreEnvironmentFit(roleProfile, resumeSignals);
  const riskPenalty = scoreRiskPenalty(resumeSignals);

  // Base readiness score sums to exactly 100 points
  const baseReadinessScore = relevance + depth + adaptability + environmentFit;

  // Ensure all values are valid numbers
  const safeBaseReadinessScore = isNaN(baseReadinessScore) ? 0 : baseReadinessScore;
  const safeRiskPenalty = isNaN(riskPenalty) ? 0 : riskPenalty;

  return {
    relevance: isNaN(relevance) ? 0 : relevance,
    depth: isNaN(depth) ? 0 : depth,
    adaptability: isNaN(adaptability) ? 0 : adaptability,
    environmentFit: isNaN(environmentFit) ? 0 : environmentFit,
    riskPenalty: safeRiskPenalty, // Applied separately as deduction
    baseReadinessScore: Math.max(0, Math.min(100, safeBaseReadinessScore))
  };
}

/**
 * Role Alignment: 25 points max
 * Measures alignment between JD expectations and resume evidence
 */
function scoreRelevance(roleProfile, resumeSignals) {
  let score = 12; // Base score

  // Execution style alignment: +8 points if strong match
  if (roleProfile.executionStyle === "execution-heavy" &&
      resumeSignals.actionEvidence === "strong") {
    score += 8;
  } else if (roleProfile.executionStyle === "execution-heavy" &&
             resumeSignals.actionEvidence === "moderate") {
    score += 4;
  }

  // Learning curve alignment: +5 points if match
  if (roleProfile.learningCurve === "steep" &&
      resumeSignals.adaptabilitySignals !== "weak") {
    score += 5;
  }

  return Math.min(25, Math.max(0, score));
}

/**
 * Skill Realism: 25 points max
 * Measures depth and repeated usage of technical skills
 */
function scoreDepth(resumeSignals) {
  if (resumeSignals.skillDepth === "strong") return 25;
  if (resumeSignals.skillDepth === "moderate") return 15;
  return 8;
}

/**
 * Adaptability: 25 points max
 * Measures ability to learn quickly and adapt
 */
function scoreAdaptability(roleProfile, resumeSignals) {
  let score = 12; // Base score

  // Strong adaptability signals: +10 points
  if (resumeSignals.adaptabilitySignals === "strong") {
    score += 10;
  } else if (resumeSignals.adaptabilitySignals === "moderate") {
    score += 5;
  }

  // Penalty if steep learning curve but weak adaptability: -7 points
  if (roleProfile.learningCurve === "steep" &&
      resumeSignals.adaptabilitySignals === "weak") {
    score -= 7;
  }

  return Math.min(25, Math.max(0, score));
}

/**
 * Eligibility & Fit: 25 points max
 * Measures production exposure and environment fit
 */
function scoreEnvironmentFit(roleProfile, resumeSignals) {
  let score = 12; // Base score

  // Edge case: ensure environmentExposure is an array
  const environmentExposure = Array.isArray(resumeSignals.environmentExposure) 
    ? resumeSignals.environmentExposure 
    : [];

  // Production exposure bonus: +8 points if execution-heavy role
  if (environmentExposure.includes("production") &&
      roleProfile.executionStyle === "execution-heavy") {
    score += 8;
  } else if (environmentExposure.includes("production")) {
    score += 5;
  }

  // Penalty for academic-only experience in ambiguous role: -5 points
  if (environmentExposure.includes("academic") &&
      roleProfile.structureLevel === "ambiguous" &&
      !environmentExposure.includes("production")) {
    score -= 5;
  }

  return Math.min(25, Math.max(0, score));
}

/**
 * Risk Penalty: Calculated separately, applied as deduction
 * Returns points to deduct (0 if no risks)
 */
function scoreRiskPenalty(resumeSignals) {
  // Only apply penalty if risks exist
  if (!resumeSignals.riskFlags || resumeSignals.riskFlags.length === 0) {
    return 0;
  }
  
  // Each risk flag deducts 3 points (max 15 points)
  const penalty = resumeSignals.riskFlags.length * 3;
  return Math.min(15, penalty);
}
