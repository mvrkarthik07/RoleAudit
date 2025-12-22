/**
 * Pairs JD expectations with resume evidence
 * This is the core value: showing where JD requirements match resume evidence
 * Each pairing shows: JD expectation → Resume evidence → Match/Gap/Risk classification
 */

export function pairJDWithResume(jdEvidence, resumeEvidence) {
  const pairings = [];

  // 1. Execution Style pairing
  pairings.push(pairExecutionStyle(jdEvidence.executionStyle, resumeEvidence.actionEvidence));

  // 2. Learning Curve pairing
  pairings.push(pairLearningCurve(jdEvidence.learningCurve, resumeEvidence.adaptability));

  // 3. Environment Fit pairing
  pairings.push(pairEnvironmentFit(jdEvidence.executionStyle, resumeEvidence.environmentExposure));

  // 4. Structure Level pairing
  pairings.push(pairStructureLevel(jdEvidence.structureLevel, resumeEvidence.adaptability));

  // 5. Collaboration pairing
  pairings.push(pairCollaboration(jdEvidence.collaboration, resumeEvidence));

  // 6. Education pairing
  pairings.push(pairEducation(jdEvidence.education, resumeEvidence.education));

  // 7. Skill Depth pairing
  pairings.push(pairSkillDepth(jdEvidence, resumeEvidence.skillDepth));

  return pairings.filter(p => p !== null);
}

function pairExecutionStyle(jdExecution, resumeAction) {
  if (!jdExecution || !resumeAction) return null;

  const jdExpectsExecution = jdExecution.inference === "execution-heavy";
  const resumeShowsExecution = resumeAction.inference === "strong" || resumeAction.inference === "moderate";

  let classification;
  let explanation;

  if (jdExpectsExecution && resumeShowsExecution) {
    classification = "match";
    explanation = "JD emphasizes execution, and resume shows strong action evidence";
  } else if (jdExpectsExecution && !resumeShowsExecution) {
    classification = "gap";
    explanation = "JD emphasizes execution, but resume shows limited action evidence";
  } else {
    classification = "neutral";
    explanation = "JD does not strongly emphasize execution. This factor is not emphasized in the job description, so it does not affect readiness.";
  }

  return {
    dimension: "Execution & Delivery",
    jdExpectation: {
      inference: jdExecution.inference,
      evidence: jdExecution.evidence.executionTriggers.slice(0, 3) // Top 3 triggers
    },
    resumeEvidence: {
      inference: resumeAction.inference,
      evidence: resumeAction.evidence.snippets.slice(0, 3) // Top 3 snippets
    },
    classification,
    explanation
  };
}

function pairLearningCurve(jdLearningCurve, resumeAdaptability) {
  if (!jdLearningCurve || !resumeAdaptability) return null;

  const jdExpectsSteep = jdLearningCurve.inference === "steep";
  const resumeShowsAdaptability = resumeAdaptability.inference === "strong" || resumeAdaptability.inference === "moderate";

  let classification;
  let explanation;

  if (jdExpectsSteep && resumeShowsAdaptability) {
    classification = "match";
    explanation = "JD expects rapid learning, and resume shows adaptability evidence";
  } else if (jdExpectsSteep && !resumeShowsAdaptability) {
    classification = "risk";
    explanation = "JD expects rapid learning, but resume shows limited adaptability evidence";
  } else {
    classification = "neutral";
    explanation = "JD does not emphasize a steep learning curve. This factor is not emphasized in the job description, so it does not affect readiness.";
  }

  return {
    dimension: "Learning & Adaptation",
    jdExpectation: {
      inference: jdLearningCurve.inference,
      evidence: jdLearningCurve.evidence.steepTriggers.slice(0, 3)
    },
    resumeEvidence: {
      inference: resumeAdaptability.inference,
      evidence: [
        ...resumeAdaptability.evidence.explicitSnippets.slice(0, 2),
        ...resumeAdaptability.evidence.implicitSnippets.slice(0, 1)
      ]
    },
    classification,
    explanation
  };
}

function pairEnvironmentFit(jdExecutionStyle, resumeEnvironments) {
  if (!jdExecutionStyle || !resumeEnvironments) return null;

  const jdExpectsExecution = jdExecutionStyle.inference === "execution-heavy";
  const resumeHasProduction = resumeEnvironments.environments.includes("production");

  let classification;
  let explanation;

  if (jdExpectsExecution && resumeHasProduction) {
    classification = "match";
    explanation = "JD emphasizes execution, and resume shows production experience";
  } else if (jdExpectsExecution && !resumeHasProduction) {
    classification = "gap";
    explanation = "JD emphasizes execution, but resume lacks production exposure";
  } else {
    classification = "neutral";
    explanation = "JD does not strongly emphasize execution. This factor is not emphasized in the job description, so it does not affect readiness.";
  }

  return {
    dimension: "Production Experience",
    jdExpectation: {
      inference: jdExecutionStyle.inference,
      evidence: jdExecutionStyle.evidence.executionTriggers.slice(0, 2)
    },
    resumeEvidence: {
      inference: resumeHasProduction ? "production exposure" : "no production exposure",
      evidence: resumeHasProduction 
        ? resumeEnvironments.evidence.production.slice(0, 3)
        : []
    },
    classification,
    explanation
  };
}

function pairStructureLevel(jdStructure, resumeAdaptability) {
  if (!jdStructure || !resumeAdaptability) return null;

  const jdIsAmbiguous = jdStructure.inference === "ambiguous";
  const resumeShowsAdaptability = resumeAdaptability.inference === "strong";

  let classification;
  let explanation;

  if (jdIsAmbiguous && resumeShowsAdaptability) {
    classification = "match";
    explanation = "JD requires self-direction, and resume shows strong adaptability";
  } else if (jdIsAmbiguous && !resumeShowsAdaptability) {
    classification = "risk";
    explanation = "JD requires self-direction, but resume shows limited adaptability";
  } else {
    classification = "neutral";
    explanation = "JD does not emphasize ambiguous/self-directed work. This factor is not emphasized in the job description, so it does not affect readiness.";
  }

  return {
    dimension: "Structure & Self-Direction",
    jdExpectation: {
      inference: jdStructure.inference,
      evidence: jdStructure.evidence.ambiguousTriggers.slice(0, 3)
    },
    resumeEvidence: {
      inference: resumeAdaptability.inference,
      evidence: resumeAdaptability.evidence.explicitSnippets.slice(0, 2)
    },
    classification,
    explanation
  };
}

function pairCollaboration(jdCollaboration, resumeEvidence) {
  if (!jdCollaboration) return null;

  // Look for collaboration signals in resume evidence
  const collaborationKeywords = ["team", "collaborate", "worked with", "partnered"];
  const collaborationSnippets = [];
  
  // Search through all resume evidence snippets
  const allSnippets = [
    ...(resumeEvidence.actionEvidence?.evidence?.snippets || []),
    ...(resumeEvidence.adaptability?.evidence?.explicitSnippets || []),
    ...(resumeEvidence.adaptability?.evidence?.implicitSnippets || [])
  ];
  
  allSnippets.forEach(snippet => {
    const lowerSnippet = snippet.toLowerCase();
    collaborationKeywords.forEach(keyword => {
      if (lowerSnippet.includes(keyword) && !collaborationSnippets.includes(snippet)) {
        collaborationSnippets.push(snippet);
      }
    });
  });
  
  const hasCollaborationSignals = collaborationSnippets.length > 0;

  let classification;
  let explanation;

  if (jdCollaboration.inference === "high" && hasCollaborationSignals) {
    classification = "match";
    explanation = "JD emphasizes collaboration, and resume shows collaboration experience";
  } else if (jdCollaboration.inference === "high" && !hasCollaborationSignals) {
    classification = "gap";
    explanation = "JD emphasizes collaboration, but resume shows limited collaboration signals";
  } else {
    classification = "neutral";
    explanation = "JD does not strongly emphasize collaboration. This factor is not emphasized in the job description, so it does not affect readiness.";
  }

  return {
    dimension: "Collaboration",
    jdExpectation: {
      inference: jdCollaboration.inference,
      evidence: jdCollaboration.evidence.triggers.slice(0, 3)
    },
    resumeEvidence: {
      inference: hasCollaborationSignals ? "collaboration signals present" : "limited collaboration signals",
      evidence: collaborationSnippets.slice(0, 3)
    },
    classification,
    explanation
  };
}

function pairEducation(jdEducation, resumeEducation) {
  if (!jdEducation || !resumeEducation) return null;

  const hasEducationMatch = resumeEducation.background !== "unspecified";
  const jdHasRequirements = jdEducation.requirements && jdEducation.requirements.length > 0;

  let classification;
  let explanation;

  if (jdEducation.openToAll) {
    classification = "match";
    explanation = "JD is open to all majors";
  } else if (!jdHasRequirements) {
    classification = "neutral";
    explanation = "JD does not specify education requirements. This factor is not emphasized in the job description, so it does not affect readiness.";
  } else if (hasEducationMatch) {
    classification = "match";
    explanation = "Resume shows education background";
  } else {
    classification = "gap";
    explanation = "JD specifies education requirements, but resume education is unspecified";
  }

  return {
    dimension: "Education & Eligibility",
    jdExpectation: {
      inference: jdEducation.openToAll ? "open to all majors" : 
                 jdHasRequirements ? jdEducation.requirements.join(", ") : "not specified",
      evidence: jdEducation.evidence.slice(0, 3)
    },
    resumeEvidence: {
      inference: resumeEducation.background,
      evidence: resumeEducation.evidence.slice(0, 3)
    },
    classification,
    explanation
  };
}

function pairSkillDepth(jdEvidence, resumeSkillDepth) {
  if (!resumeSkillDepth) return null;

  // Skill depth is primarily a resume signal, not a JD requirement
  // But we can show it as a general strength
  return {
    dimension: "Technical Depth",
    jdExpectation: {
      inference: "general technical competence expected",
      evidence: []
    },
    resumeEvidence: {
      inference: resumeSkillDepth.inference,
      evidence: [
        ...resumeSkillDepth.evidence.sectionSnippets.slice(0, 2),
        ...resumeSkillDepth.evidence.skillSnippets.slice(0, 2)
      ]
    },
    classification: resumeSkillDepth.inference === "strong" ? "strength" : "neutral",
    explanation: `Resume shows ${resumeSkillDepth.inference} technical depth`
  };
}

