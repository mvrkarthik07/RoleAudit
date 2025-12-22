/**
 * Extracts JD signals with exact textual evidence
 * Every claim must be backed by specific JD text
 */

import { extractEducationRequirements } from "./extractEducationRequirements";

export function extractJDEvidence(jdText) {
  const text = jdText.toLowerCase();
  const originalText = jdText; // Keep original for exact quotes

  return {
    executionStyle: extractExecutionStyleEvidence(text, originalText),
    structureLevel: extractStructureLevelEvidence(text, originalText),
    collaboration: extractCollaborationEvidence(text, originalText),
    learningCurve: extractLearningCurveEvidence(text, originalText),
    speedVsQuality: extractSpeedVsQualityEvidence(text, originalText),
    education: extractEducationEvidence(jdText)
  };
}

function extractExecutionStyleEvidence(text, originalText) {
  const executionKeywords = [
    "build", "implement", "develop", "deliver", "deploy",
    "maintain", "optimize", "own"
  ];

  const researchKeywords = [
    "research", "explore", "investigate", "experiment",
    "analyze", "theoretical"
  ];

  const executionTriggers = findTextTriggers(executionKeywords, text, originalText);
  const researchTriggers = findTextTriggers(researchKeywords, text, originalText);

  const executionCount = executionTriggers.length;
  const researchCount = researchTriggers.length;

  let inference;
  if (executionCount > researchCount) {
    inference = "execution-heavy";
  } else if (researchCount > executionCount) {
    inference = "exploratory";
  } else {
    inference = "balanced";
  }

  return {
    inference,
    evidence: {
      executionTriggers,
      researchTriggers,
      executionCount,
      researchCount
    }
  };
}

function extractStructureLevelEvidence(text, originalText) {
  const structuredKeywords = [
    "process", "standard", "procedure", "documentation",
    "compliance", "guidelines"
  ];

  const ambiguousKeywords = [
    "ambiguous", "0-1", "fast-paced", "wear many hats",
    "self-directed", "ownership"
  ];

  const structuredTriggers = findTextTriggers(structuredKeywords, text, originalText);
  const ambiguousTriggers = findTextTriggers(ambiguousKeywords, text, originalText);

  const structuredCount = structuredTriggers.length;
  const ambiguousCount = ambiguousTriggers.length;

  let inference;
  if (structuredCount >= 2 && structuredCount > ambiguousCount) {
    inference = "structured";
  } else if (ambiguousCount >= 2 && ambiguousCount > structuredCount) {
    inference = "ambiguous";
  } else {
    inference = "moderate";
  }

  return {
    inference,
    evidence: {
      structuredTriggers,
      ambiguousTriggers,
      structuredCount,
      ambiguousCount
    }
  };
}

function extractCollaborationEvidence(text, originalText) {
  const collaborationKeywords = [
    "collaborate", "cross-functional", "stakeholders",
    "team", "mentors", "clients"
  ];

  const triggers = findTextTriggers(collaborationKeywords, text, originalText);
  const count = triggers.length;

  let inference;
  if (count >= 4) {
    inference = "high";
  } else if (count >= 2) {
    inference = "medium";
  } else {
    inference = "low";
  }

  return {
    inference,
    evidence: {
      triggers,
      count
    }
  };
}

function extractLearningCurveEvidence(text, originalText) {
  const steepKeywords = [
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

  const gradualKeywords = [
    "prior experience",
    "domain knowledge",
    "industry experience",
    "years of experience"
  ];

  const steepTriggers = findTextTriggers(steepKeywords, text, originalText);
  const gradualTriggers = findTextTriggers(gradualKeywords, text, originalText);

  const steepCount = steepTriggers.length;
  const gradualCount = gradualTriggers.length;

  let inference;
  if (steepCount > gradualCount) {
    inference = "steep";
  } else if (gradualCount > steepCount) {
    inference = "gradual";
  } else {
    inference = "moderate";
  }

  return {
    inference,
    evidence: {
      steepTriggers,
      gradualTriggers,
      steepCount,
      gradualCount
    }
  };
}

function extractSpeedVsQualityEvidence(text, originalText) {
  const isInternRole = text.includes("intern") || 
                       text.includes("internship") || 
                       text.includes("training") || 
                       text.includes("mentorship");

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

  const speedTriggers = findTextTriggers(speedKeywords, text, originalText);
  const qualityTriggers = findTextTriggers(qualityKeywords, text, originalText);

  const speedCount = speedTriggers.length;
  const qualityCount = qualityTriggers.length;

  let inference;
  if (!isInternRole && qualityCount >= 2 && qualityCount > speedCount) {
    inference = "quality-focused";
  } else if (speedCount >= 2 && speedCount > qualityCount) {
    inference = "speed-focused";
  } else {
    inference = "balanced";
  }

  return {
    inference,
    evidence: {
      speedTriggers,
      qualityTriggers,
      speedCount,
      qualityCount,
      isInternRole
    }
  };
}

function extractEducationEvidence(jdText) {
  const educationReqs = extractEducationRequirements(jdText);
  
  // Find the actual text snippets that mention education
  const text = jdText.toLowerCase();
  const lines = jdText.split(/\n|\.|;/);
  const educationSnippets = [];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("degree") || 
        lowerLine.includes("diploma") || 
        lowerLine.includes("major") || 
        lowerLine.includes("education") ||
        lowerLine.includes("background") ||
        lowerLine.includes("qualification")) {
      educationSnippets.push(line.trim());
    }
  });

  return {
    requirements: educationReqs.rawEducationRequirements,
    openToAll: educationReqs.openToAll,
    fullTimeOnly: educationReqs.fullTimeOnly,
    evidence: educationSnippets
  };
}

/**
 * Finds text triggers - extracts actual snippets from original text
 * that contain the keywords
 */
function findTextTriggers(keywords, lowerText, originalText) {
  const triggers = [];
  const lines = originalText.split(/\n|\.|;/);

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerText.includes(lowerKeyword)) {
      // Find the line(s) containing this keyword
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(lowerKeyword)) {
          const trimmed = line.trim();
          if (trimmed.length > 0 && !triggers.includes(trimmed)) {
            triggers.push(trimmed);
          }
        }
      });
    }
  });

  return triggers;
}

