export function applyScoreSmoothing(score, roleProfile, resumeSignals) {
  let adjustment = 0;

  // Slight bonus for production exposure depth
  if (resumeSignals.environmentExposure.includes("production")) {
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

  return Math.round(score + adjustment);
}
