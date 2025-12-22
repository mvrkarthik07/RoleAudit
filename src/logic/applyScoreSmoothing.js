export function applyScoreSmoothing(score, roleProfile, resumeSignals) {
  // Edge case: invalid inputs
  if (typeof score !== 'number' || isNaN(score)) {
    return 0;
  }
  
  if (!roleProfile || !resumeSignals) {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  let adjustment = 0;

  // Slight bonus for production exposure depth
  if (resumeSignals.environmentExposure && 
      Array.isArray(resumeSignals.environmentExposure) &&
      resumeSignals.environmentExposure.includes("production")) {
    adjustment += 1.5;
  }

  // Slight penalty if role is ambiguous and adaptability is not strong
  if (
    roleProfile.structureLevel === "ambiguous" &&
    resumeSignals.adaptabilitySignals !== "strong"
  ) {
    adjustment -= 1.5;
  }

  // Small variance based on collaboration fit
  if (
    roleProfile.collaboration === "high" &&
    resumeSignals.actionEvidence === "strong"
  ) {
    adjustment += 1;
  }

  const finalScore = score + adjustment;
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}
