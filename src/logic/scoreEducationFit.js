import { normalizeEducation, normalizeEducationRequirements } from "./normalizeEducation";

/**
 * Computes education fit multiplier based on JD requirements vs resume background
 * Returns a multiplier between 0.5 and 1.0
 */
export function scoreEducationFit(jdEducationRequirements, resumeEducationBackground) {
  // If JD is open to all majors, return 1.0
  if (jdEducationRequirements.openToAll) {
    return 1.0;
  }

  // If no education requirement specified, return ~0.9
  if (!jdEducationRequirements.rawEducationRequirements || 
      jdEducationRequirements.rawEducationRequirements.length === 0) {
    return 0.9;
  }

  // If resume has no education background, apply penalty
  if (!resumeEducationBackground || resumeEducationBackground === "unspecified") {
    return 0.6;
  }

  // Normalize both sides
  const jdTokens = normalizeEducationRequirements(jdEducationRequirements.rawEducationRequirements);
  const resumeTokens = normalizeEducation(resumeEducationBackground);

  // If no meaningful tokens extracted, default to moderate match
  if (jdTokens.length === 0) {
    return 0.85;
  }

  if (resumeTokens.length === 0) {
    return 0.6;
  }

  // Compute token overlap similarity
  const overlap = computeTokenOverlap(jdTokens, resumeTokens);
  
  // Map overlap to multiplier
  return mapOverlapToMultiplier(overlap, jdTokens.length, resumeTokens.length);
}

/**
 * Computes token overlap between JD requirements and resume background
 * Returns a value between 0 and 1
 */
function computeTokenOverlap(jdTokens, resumeTokens) {
  const jdSet = new Set(jdTokens);
  const resumeSet = new Set(resumeTokens);

  // Count exact matches
  let exactMatches = 0;
  const matchedJDTokens = new Set();
  const matchedResumeTokens = new Set();
  
  jdSet.forEach(token => {
    if (resumeSet.has(token)) {
      exactMatches++;
      matchedJDTokens.add(token);
      matchedResumeTokens.add(token);
    }
  });

  // Count related matches (partial/substring matches) for unmatched tokens
  let relatedMatches = 0;
  const relatedPairs = new Set(); // Track pairs to avoid double-counting
  
  jdSet.forEach(jdToken => {
    if (matchedJDTokens.has(jdToken)) return; // Skip already matched
    
    resumeSet.forEach(resumeToken => {
      if (matchedResumeTokens.has(resumeToken)) return; // Skip already matched
      
      // Check if tokens are related (one contains the other or vice versa)
      if (jdToken !== resumeToken && 
          (jdToken.includes(resumeToken) || resumeToken.includes(jdToken))) {
        const pairKey = `${jdToken}:${resumeToken}`;
        if (!relatedPairs.has(pairKey)) {
          relatedPairs.add(pairKey);
          relatedMatches++;
        }
      }
    });
  });

  // Weight exact matches more heavily
  const totalMatches = exactMatches + (relatedMatches * 0.3);
  const maxPossible = Math.max(jdTokens.length, resumeTokens.length);

  if (maxPossible === 0) return 0;

  return totalMatches / maxPossible;
}

/**
 * Maps overlap score to a multiplier between 0.5 and 1.0
 */
function mapOverlapToMultiplier(overlap, jdTokenCount, resumeTokenCount) {
  // Strong overlap (>= 0.6) → 1.0
  if (overlap >= 0.6) {
    return 1.0;
  }

  // Related field (0.3 to 0.6) → ~0.85
  if (overlap >= 0.3) {
    // Scale between 0.85 and 1.0 based on overlap
    return 0.85 + (overlap - 0.3) * (0.15 / 0.3);
  }

  // Weak overlap (0.1 to 0.3) → ~0.7
  if (overlap >= 0.1) {
    // Scale between 0.7 and 0.85 based on overlap
    return 0.7 + (overlap - 0.1) * (0.15 / 0.2);
  }

  // Clear mismatch (< 0.1) → ~0.5
  // Scale between 0.5 and 0.7 based on overlap
  return 0.5 + overlap * 2.0;
}

/**
 * Computes full-time constraint multiplier
 * Returns a multiplier (typically 1.0 or slightly less for part-time resumes)
 */
export function scoreFullTimeFit(jdEducationRequirements, resumeText) {
  // If JD doesn't require full-time, no penalty
  if (!jdEducationRequirements.fullTimeOnly) {
    return 1.0;
  }

  const resumeLower = resumeText.toLowerCase();

  // Check for part-time indicators in resume
  const partTimeIndicators = [
    "part-time",
    "part time",
    "parttime",
    "freelance",
    "contractor",
    "consulting",
    "on-call",
    "on call"
  ];

  const hasPartTimeSignal = partTimeIndicators.some(indicator => 
    resumeLower.includes(indicator)
  );

  // If resume suggests part-time, apply soft penalty
  if (hasPartTimeSignal) {
    return 0.92; // Small penalty, not rejection
  }

  // No part-time signals, full-time is fine
  return 1.0;
}

