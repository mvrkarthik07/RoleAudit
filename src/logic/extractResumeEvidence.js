/**
 * Extracts resume evidence with quotable snippets
 * Every strength/gap must be backed by specific resume text
 */

import { normalizeEducation, normalizeEducationRequirements } from "./normalizeEducation";

export function extractResumeEvidence(resumeText, jdEducationRequirements = null) {
  const text = resumeText.toLowerCase();

  return {
    actionEvidence: extractActionEvidence(resumeText, text),
    skillDepth: extractSkillDepthEvidence(resumeText, text),
    adaptability: extractAdaptabilityEvidence(resumeText, text),
    environmentExposure: extractEnvironmentExposureEvidence(resumeText, text),
    riskFlags: extractRiskFlagsEvidence(resumeText, text, jdEducationRequirements),
    education: extractEducationEvidence(resumeText)
  };
}

function extractActionEvidence(resumeText, text) {
  const actionVerbs = [
    "built", "implemented", "developed", "designed",
    "integrated", "deployed", "maintained", "optimized",
    "contributed", "led"
  ];

  const snippets = [];
  const lines = resumeText.split(/\n|\.|;/);

  actionVerbs.forEach(verb => {
    const lowerVerb = verb.toLowerCase();
    if (text.includes(lowerVerb)) {
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(lowerVerb)) {
          const trimmed = line.trim();
          if (trimmed.length > 0 && !snippets.includes(trimmed)) {
            snippets.push(trimmed);
          }
        }
      });
    }
  });

  const count = snippets.length;
  let inference;
  if (count >= 8) {
    inference = "strong";
  } else if (count >= 4) {
    inference = "moderate";
  } else {
    inference = "weak";
  }

  return {
    inference,
    evidence: {
      snippets,
      count,
      actionVerbs: actionVerbs.filter(v => text.includes(v.toLowerCase()))
    }
  };
}

function extractSkillDepthEvidence(resumeText, text) {
  const sections = ["projects", "experience", "work"];
  const skillMentions = [
    "react", "python", "java", "sql", "api", "backend", "frontend"
  ];

  const sectionSnippets = [];
  const skillSnippets = [];
  const lines = resumeText.split(/\n|\.|;/);

  // Find section mentions
  sections.forEach(section => {
    if (text.includes(section)) {
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(section)) {
          const trimmed = line.trim();
          if (trimmed.length > 0 && !sectionSnippets.includes(trimmed)) {
            sectionSnippets.push(trimmed);
          }
        }
      });
    }
  });

  // Find skill mentions (with repetition tracking)
  const skillCounts = {};
  skillMentions.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    if (text.includes(lowerSkill)) {
      const occurrences = text.split(lowerSkill).length - 1;
      skillCounts[skill] = occurrences;
      
      if (occurrences >= 2) {
        lines.forEach(line => {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes(lowerSkill)) {
            const trimmed = line.trim();
            if (trimmed.length > 0 && !skillSnippets.includes(trimmed)) {
              skillSnippets.push(trimmed);
            }
          }
        });
      }
    }
  });

  const depthSignals = sectionSnippets.length;
  const repeatedSkills = Object.values(skillCounts).filter(count => count >= 2).length;

  let inference;
  if (repeatedSkills >= 3 && depthSignals >= 2) {
    inference = "strong";
  } else if (repeatedSkills >= 1) {
    inference = "moderate";
  } else {
    inference = "weak";
  }

  return {
    inference,
    evidence: {
      sectionSnippets,
      skillSnippets,
      skillCounts,
      depthSignals,
      repeatedSkills
    }
  };
}

function extractAdaptabilityEvidence(resumeText, text) {
  const explicitSignals = [
    "learned", "self-taught", "explored",
    "adapted", "iterated", "improved"
  ];

  const implicitSignals = [
    "project", "hackathon", "intern", "built"
  ];

  const explicitSnippets = [];
  const implicitSnippets = [];
  const lines = resumeText.split(/\n|\.|;/);

  explicitSignals.forEach(signal => {
    const lowerSignal = signal.toLowerCase();
    if (text.includes(lowerSignal)) {
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(lowerSignal)) {
          const trimmed = line.trim();
          if (trimmed.length > 0 && !explicitSnippets.includes(trimmed)) {
            explicitSnippets.push(trimmed);
          }
        }
      });
    }
  });

  implicitSignals.forEach(signal => {
    const lowerSignal = signal.toLowerCase();
    if (text.includes(lowerSignal)) {
      lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes(lowerSignal)) {
          const trimmed = line.trim();
          if (trimmed.length > 0 && !implicitSnippets.includes(trimmed)) {
            implicitSnippets.push(trimmed);
          }
        }
      });
    }
  });

  const score = explicitSnippets.length + implicitSnippets.length;
  let inference;
  if (score >= 5) {
    inference = "strong";
  } else if (score >= 3) {
    inference = "moderate";
  } else {
    inference = "weak";
  }

  return {
    inference,
    evidence: {
      explicitSnippets,
      implicitSnippets,
      score
    }
  };
}

function extractEnvironmentExposureEvidence(resumeText, text) {
  const environments = [];
  const evidence = {
    internship: [],
    project: [],
    academic: [],
    production: []
  };

  const lines = resumeText.split(/\n|\.|;/);

  if (text.includes("intern") || text.includes("internship")) {
    environments.push("internship");
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("intern") || lowerLine.includes("internship")) {
        const trimmed = line.trim();
        if (trimmed.length > 0 && !evidence.internship.includes(trimmed)) {
          evidence.internship.push(trimmed);
        }
      }
    });
  }

  if (text.includes("project")) {
    environments.push("project-based");
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("project")) {
        const trimmed = line.trim();
        if (trimmed.length > 0 && !evidence.project.includes(trimmed)) {
          evidence.project.push(trimmed);
        }
      }
    });
  }

  if (text.includes("course") || text.includes("coursework")) {
    environments.push("academic");
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("course") || lowerLine.includes("coursework")) {
        const trimmed = line.trim();
        if (trimmed.length > 0 && !evidence.academic.includes(trimmed)) {
          evidence.academic.push(trimmed);
        }
      }
    });
  }

  if (text.includes("deployed") || text.includes("production")) {
    environments.push("production");
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("deployed") || lowerLine.includes("production")) {
        const trimmed = line.trim();
        if (trimmed.length > 0 && !evidence.production.includes(trimmed)) {
          evidence.production.push(trimmed);
        }
      }
    });
  }

  return {
    environments,
    evidence
  };
}

function extractRiskFlagsEvidence(resumeText, text, jdEducationRequirements = null) {
  const risks = [];
  const evidence = [];

  const lines = resumeText.split(/\n|\.|;/);

  if (!text.includes("deploy") && !text.includes("production")) {
    risks.push("Limited production exposure");
    evidence.push({
      risk: "Limited production exposure",
      explanation: "No mentions of 'deploy' or 'production' found in resume"
    });
  }

  if (text.includes("student") && !text.includes("intern")) {
    risks.push("Primarily academic experience");
    const studentLines = lines.filter(line => 
      line.toLowerCase().includes("student") && 
      !line.toLowerCase().includes("intern")
    );
    evidence.push({
      risk: "Primarily academic experience",
      snippets: studentLines.map(l => l.trim()).filter(l => l.length > 0)
    });
  }

  const projectCount = text.split("project").length - 1;
  if (projectCount < 2) {
    risks.push("Limited project depth");
    evidence.push({
      risk: "Limited project depth",
      explanation: `Found ${projectCount} mention(s) of 'project' (expected 2+)`
    });
  }

  // Major mismatch detection
  if (jdEducationRequirements && !jdEducationRequirements.openToAll) {
    const majorMismatch = detectMajorMismatch(resumeText, jdEducationRequirements);
    if (majorMismatch.isMismatch) {
      risks.push("Major mismatch with role requirements");
      const educationLines = lines.filter(line => {
        const lowerLine = line.toLowerCase();
        return lowerLine.includes("major") || 
               lowerLine.includes("degree") || 
               lowerLine.includes("bachelor") || 
               lowerLine.includes("master") ||
               lowerLine.includes("education");
      });
      evidence.push({
        risk: "Major mismatch with role requirements",
        explanation: majorMismatch.explanation,
        snippets: educationLines.map(l => l.trim()).filter(l => l.length > 0).slice(0, 3)
      });
    }
  }

  return {
    risks,
    evidence
  };
}

function detectMajorMismatch(resumeText, jdEducationRequirements) {
  // If JD is open to all majors, no mismatch
  if (jdEducationRequirements.openToAll) {
    return { isMismatch: false };
  }

  // If no JD requirements specified, no mismatch
  if (!jdEducationRequirements.rawEducationRequirements || 
      jdEducationRequirements.rawEducationRequirements.length === 0) {
    return { isMismatch: false };
  }

  // Extract resume education
  const resumeEducation = extractEducationEvidence(resumeText);
  if (!resumeEducation.background || resumeEducation.background === "unspecified") {
    return { isMismatch: false }; // Can't determine mismatch if resume doesn't specify
  }

  // Normalize both sides for comparison
  const jdTokens = normalizeEducationRequirements(jdEducationRequirements.rawEducationRequirements);
  const resumeTokens = normalizeEducation(resumeEducation.background);

  // If no meaningful tokens extracted, can't determine mismatch
  if (jdTokens.length === 0 || resumeTokens.length === 0) {
    return { isMismatch: false };
  }

  // Check for overlap
  const jdSet = new Set(jdTokens);
  const resumeSet = new Set(resumeTokens);

  // Count matches
  let matches = 0;
  jdSet.forEach(token => {
    if (resumeSet.has(token)) {
      matches++;
    }
  });

  // Also check for related matches (substring matches)
  let relatedMatches = 0;
  jdSet.forEach(jdToken => {
    resumeSet.forEach(resumeToken => {
      if (jdToken !== resumeToken && 
          (jdToken.includes(resumeToken) || resumeToken.includes(jdToken))) {
        relatedMatches++;
      }
    });
  });

  // If there's no match or related match, it's a mismatch
  const hasMatch = matches > 0 || relatedMatches > 0;
  
  if (!hasMatch) {
    const jdMajor = jdEducationRequirements.rawEducationRequirements[0] || "specified major";
    return {
      isMismatch: true,
      explanation: `Role requires ${jdMajor}, but resume shows different major/field. This may impact eligibility.`
    };
  }

  return { isMismatch: false };
}

function extractEducationEvidence(resumeText) {
  const lines = resumeText.split(/\n/);
  const educationLines = [];

  for (let line of lines) {
    const lowerLine = line.toLowerCase();
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

  return {
    background: educationLines.length > 0 ? educationLines.join(" ") : "unspecified",
    evidence: educationLines
  };
}

