export function extractEducationRequirements(jdText) {
  const text = jdText.toLowerCase();
  
  // Extract raw education requirements
  const rawEducationRequirements = extractEducationPhrases(text);
  
  // Detect "open to all majors"
  const openToAll = detectOpenToAll(text);
  
  // Detect "full-time only" constraints
  const fullTimeOnly = detectFullTimeOnly(text);
  
  return {
    rawEducationRequirements,
    openToAll,
    fullTimeOnly
  };
}

function extractEducationPhrases(text) {
  const requirements = [];
  const lines = text.split(/\n|\.|;/);
  
  // Patterns that indicate education requirements
  const educationPatterns = [
    /degree in [^,\.;]+/gi,
    /diploma in [^,\.;]+/gi,
    /background in [^,\.;]+/gi,
    /studied [^,\.;]+/gi,
    /major in [^,\.;]+/gi,
    /majoring in [^,\.;]+/gi,
    /bachelor[^,\.;]*in [^,\.;]+/gi,
    /master[^,\.;]*in [^,\.;]+/gi,
    /phd[^,\.;]*in [^,\.;]+/gi,
    /education in [^,\.;]+/gi,
    /qualification in [^,\.;]+/gi,
    /certification in [^,\.;]+/gi
  ];
  
  lines.forEach(line => {
    educationPatterns.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Clean up the match
          let cleaned = match.trim();
          // Remove common prefixes
          cleaned = cleaned.replace(/^(degree|diploma|background|studied|major|majoring|bachelor|master|phd|education|qualification|certification)\s+(in|of)\s+/i, '');
          if (cleaned.length > 2) {
            requirements.push(cleaned);
          }
        });
      }
    });
  });
  
  // Also look for standalone field mentions in context
  const fieldKeywords = [
    'computer science', 'engineering', 'mathematics', 'statistics',
    'business', 'economics', 'finance', 'accounting', 'marketing',
    'data science', 'information systems', 'software engineering',
    'electrical engineering', 'mechanical engineering', 'civil engineering'
  ];
  
  fieldKeywords.forEach(field => {
    const fieldPattern = new RegExp(`\\b${field}\\b`, 'gi');
    if (text.match(fieldPattern)) {
      // Check if it's in an education context
      const contextWindow = 50;
      const index = text.indexOf(field);
      if (index !== -1) {
        const start = Math.max(0, index - contextWindow);
        const end = Math.min(text.length, index + field.length + contextWindow);
        const context = text.substring(start, end);
        if (context.match(/(degree|diploma|major|background|education|qualification|studied)/i)) {
          if (!requirements.some(r => r.toLowerCase().includes(field))) {
            requirements.push(field);
          }
        }
      }
    }
  });
  
  return [...new Set(requirements)]; // Remove duplicates
}

function detectOpenToAll(text) {
  const openToAllPatterns = [
    /open to all majors/gi,
    /all majors welcome/gi,
    /any major/gi,
    /all backgrounds/gi,
    /open to all backgrounds/gi,
    /any degree/gi,
    /all degrees/gi,
    /no specific major required/gi,
    /major agnostic/gi
  ];
  
  return openToAllPatterns.some(pattern => pattern.test(text));
}

function detectFullTimeOnly(text) {
  const fullTimePatterns = [
    /full[-\s]time only/gi,
    /must be full[-\s]time/gi,
    /full[-\s]time required/gi,
    /full[-\s]time commitment/gi,
    /not open to part[-\s]time/gi,
    /part[-\s]time not accepted/gi
  ];
  
  return fullTimePatterns.some(pattern => pattern.test(text));
}
