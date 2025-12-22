export function applyCoverLetterModifier(
  baseScore,
  coverLetterText,
  roleProfile,
  jdRequiresCoverLetter
) {
  if (!coverLetterText || coverLetterText.trim().length === 0) {
    if (jdRequiresCoverLetter) {
      return {
        adjustedScore: Math.max(0, baseScore - 10),
        modifier: -10,
        explanation:
          "This role explicitly asks for a cover letter, but none was provided."
      };
    }

    return {
      adjustedScore: baseScore,
      modifier: 0,
      explanation: "No cover letter provided; score unchanged."
    };
  }

  const text = coverLetterText.toLowerCase();
  let signalScore = 0;

  // Role understanding
  if (text.includes("this role") || text.includes("position")) signalScore++;

  // Evidence mapping
  if (text.includes("experience") || text.includes("because")) signalScore++;

  // Specificity (anti-generic)
  if (!text.includes("any organization") && !text.includes("any role")) {
    signalScore++;
  }

  // Adaptation intent
  if (text.includes("learn") || text.includes("grow") || text.includes("adapt")) {
    signalScore++;
  }

  let modifier = 0;

  if (signalScore >= 3) modifier = jdRequiresCoverLetter ? 12 : 8;
  else if (signalScore === 2) modifier = jdRequiresCoverLetter ? 6 : 4;
  else modifier = jdRequiresCoverLetter ? -8 : -4;

  const adjustedScore = Math.min(90, Math.max(0, baseScore + modifier));

  return {
    adjustedScore,
    modifier,
    explanation:
      modifier > 0
        ? "Cover letter demonstrates role understanding and strengthens readiness."
        : "Cover letter is generic or weakly aligned, reducing confidence in intent."
  };
}
