export function extractResumeSignals(resumeText) {
  const text = resumeText.toLowerCase();

  return {
    actionEvidence: inferActionEvidence(text),
    skillDepth: inferSkillDepth(text),
    adaptabilitySignals: inferAdaptability(text),
    environmentExposure: inferEnvironmentExposure(text),
    riskFlags: inferRiskFlags(text),
    educationBackground: inferEducationBackground(resumeText)
  };
}
function inferActionEvidence(text) {
  const actionVerbs = [
    "built", "implemented", "developed", "designed",
    "integrated", "deployed", "maintained", "optimized",
    "contributed", "led"
  ];

  let count = 0;

  actionVerbs.forEach(word => {
    count += text.split(word).length - 1;
  });

  if (count >= 8) return "strong";
  if (count >= 4) return "moderate";
  return "weak";
}

function inferSkillDepth(text) {
  const sections = ["projects", "experience", "work"];
  let depthSignals = 0;

  sections.forEach(section => {
    if (text.includes(section)) depthSignals++;
  });

  const skillMentions = [
    "react", "python", "java", "sql", "api", "backend", "frontend"
  ];

  let repeatedUsage = 0;

  skillMentions.forEach(skill => {
    const occurrences = text.split(skill).length - 1;
    if (occurrences >= 2) repeatedUsage++;
  });

  if (repeatedUsage >= 3 && depthSignals >= 2) return "strong";
  if (repeatedUsage >= 1) return "moderate";
  return "weak";
}
function inferAdaptability(text) {
  let score = 0;

  const explicitSignals = [
    "learned", "self-taught", "explored",
    "adapted", "iterated", "improved"
  ];

  explicitSignals.forEach(word => {
    if (text.includes(word)) score++;
  });

  // Implicit adaptability signals
  if (text.includes("project")) score++;
  if (text.includes("hackathon")) score++;
  if (text.includes("intern")) score++;
  if (text.includes("built")) score++;

  if (score >= 5) return "strong";
  if (score >= 3) return "moderate";
  return "weak";
}

function inferEnvironmentExposure(text) {
  const environments = [];

  if (text.includes("intern") || text.includes("internship")) {
    environments.push("internship");
  }

  if (text.includes("project")) {
    environments.push("project-based");
  }

  if (text.includes("course") || text.includes("coursework")) {
    environments.push("academic");
  }

  if (text.includes("deployed") || text.includes("production")) {
    environments.push("production");
  }

  return environments;
}
function inferRiskFlags(text) {
  const risks = [];

  if (!text.includes("deploy") && !text.includes("production")) {
    risks.push("Limited production exposure");
  }

  if (text.includes("student") && !text.includes("intern")) {
    risks.push("Primarily academic experience");
  }

  if (text.split("project").length - 1 < 2) {
    risks.push("Limited project depth");
  }

  return risks;
}
function inferEducationBackground(text) {
  const lines = text.split("\n");
  const educationLines = [];

  for (let line of lines) {
    const lowerLine = line.toLowerCase();
    // Check for education-related keywords
    if (
      lowerLine.includes("bachelor") ||
      lowerLine.includes("master") ||
      lowerLine.includes("phd") ||
      lowerLine.includes("doctorate") ||
      lowerLine.includes("diploma") ||
      lowerLine.includes("degree") ||
      lowerLine.includes("major") ||
      lowerLine.includes("second major") ||
      lowerLine.includes("double degree") ||
      lowerLine.includes("double major") ||
      lowerLine.includes("concentration") ||
      lowerLine.includes("specialization") ||
      lowerLine.includes("minor") ||
      lowerLine.includes("education") ||
      lowerLine.includes("university") ||
      lowerLine.includes("college")
    ) {
      educationLines.push(line.trim());
    }
  }

  // If no education lines found, return unspecified
  if (educationLines.length === 0) {
    return "unspecified";
  }

  // Join all education-related lines with space
  return educationLines.join(" ");
}
