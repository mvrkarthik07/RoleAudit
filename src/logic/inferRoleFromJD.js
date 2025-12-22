export function inferRoleFromJD(jdText) {
  const text = jdText.toLowerCase();

  return {
    executionStyle: inferExecutionStyle(text),
    structureLevel: inferStructureLevel(text),
    collaboration: inferCollaboration(text),
    learningCurve: inferLearningCurve(text),
    speedVsQuality: inferSpeedVsQuality(text)
  };
}
function inferExecutionStyle(text) {
  const executionKeywords = [
    "build", "implement", "develop", "deliver", "deploy",
    "maintain", "optimize", "own"
  ];

  const researchKeywords = [
    "research", "explore", "investigate", "experiment",
    "analyze", "theoretical"
  ];

  let executionScore = 0;
  let researchScore = 0;

  executionKeywords.forEach(word => {
    if (text.includes(word)) executionScore++;
  });

  researchKeywords.forEach(word => {
    if (text.includes(word)) researchScore++;
  });

  if (executionScore > researchScore) return "execution-heavy";
  if (researchScore > executionScore) return "exploratory";
  return "balanced";
}
function inferStructureLevel(text) {
  const structured = [
    "process", "standard", "procedure", "documentation",
    "compliance", "guidelines"
  ];

  const ambiguous = [
    "ambiguous", "0-1", "fast-paced", "wear many hats",
    "self-directed", "ownership"
  ];

  let structuredScore = 0;
  let ambiguousScore = 0;

  structured.forEach(word => {
    if (text.includes(word)) structuredScore++;
  });

  ambiguous.forEach(word => {
    if (text.includes(word)) ambiguousScore++;
  });

 if (structuredScore >= 2 && structuredScore > ambiguousScore) {
  return "structured";
}

if (ambiguousScore >= 2 && ambiguousScore > structuredScore) {
  return "ambiguous";
}

return "moderate";

  return "moderate";
}
function inferCollaboration(text) {
  const collaborationWords = [
    "collaborate", "cross-functional", "stakeholders",
    "team", "mentors", "clients"
  ];

  let score = 0;

  collaborationWords.forEach(word => {
    if (text.includes(word)) score++;
  });

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
function inferLearningCurve(text) {
  const steep = [
  "fast learner",
  "new technologies",
  "rapidly evolving",
  "learn quickly",
  "cutting-edge",
  "intern",
  "internship",
  "hands-on",
  "exposure",
  "training",
  "mentorship"
];

  const gradual = [
  "prior experience",
  "domain knowledge",
  "industry experience",
  "years of experience"
];

  let steepScore = 0;
  let gradualScore = 0;

  steep.forEach(word => {
    if (text.includes(word)) steepScore++;
  });

  gradual.forEach(word => {
    if (text.includes(word)) gradualScore++;
  });

  if (steepScore > gradualScore) return "steep";
  if (gradualScore > steepScore) return "gradual";
  return "moderate";
}
function inferSpeedVsQuality(text) {
  const isInternRole = text.includes("intern") || text.includes("internship") || text.includes("training") || text.includes("mentorship");
  const speedKeywords = [
    "fast",
    "iterate",
    "iteration",
    "mvp",
    "quickly",
    "agile",
    "rapid"
  ];

  const qualityKeywords = [
    "accuracy",
    "precision",
    "reliability",
    "performance",
    "robust",
    "metrics",
    "evaluation",
    "quality assurance",
    "correctness"
  ];

  let speedScore = 0;
  let qualityScore = 0;

  speedKeywords.forEach(word => {
    if (text.includes(word)) speedScore++;
  });

  qualityKeywords.forEach(word => {
    if (text.includes(word)) qualityScore++;
  });

  // 🔑 THE IMPORTANT PART
  if (!isInternRole && qualityScore >= 2 && qualityScore > speedScore) {
  return "quality-focused";
}

if (speedScore >= 2 && speedScore > qualityScore) {
  return "speed-focused";
}

return "balanced";
  
}
