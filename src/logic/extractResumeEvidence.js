/**
 * Extracts resume evidence with quotable snippets
 * Every strength/gap must be backed by specific resume text
 */

export function extractResumeEvidence(resumeText) {
  const text = resumeText.toLowerCase();

  return {
    actionEvidence: extractActionEvidence(resumeText, text),
    skillDepth: extractSkillDepthEvidence(resumeText, text),
    adaptability: extractAdaptabilityEvidence(resumeText, text),
    environmentExposure: extractEnvironmentExposureEvidence(resumeText, text),
    riskFlags: extractRiskFlagsEvidence(resumeText, text),
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

function extractRiskFlagsEvidence(resumeText, text) {
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

  return {
    risks,
    evidence
  };
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

