/**
 * Normalizes education text for comparison
 * - Lowercases
 * - Removes punctuation
 * - Splits into meaningful tokens
 */
export function normalizeEducation(text) {
  if (!text || text === "unspecified") {
    return [];
  }

  // Lowercase
  let normalized = text.toLowerCase();

  // Remove punctuation but keep spaces
  normalized = normalized.replace(/[^\w\s]/g, " ");

  // Split into words
  let tokens = normalized.split(/\s+/);

  // Filter out common stop words and degree-related words that don't add meaning
  const stopWords = new Set([
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with",
    "and", "or", "but", "is", "are", "was", "were", "be", "been",
    "degree", "degrees", "diploma", "diplomas", "major", "majors",
    "minor", "minors", "bachelor", "bachelors", "master", "masters",
    "phd", "doctorate", "doctorates", "studied", "study", "studying",
    "background", "field", "fields", "in", "from", "university",
    "college", "school", "institution", "obtained", "completed",
    "pursuing", "pursue", "second", "double", "concentration",
    "specialization", "specializations"
  ]);

  // Filter tokens
  tokens = tokens.filter(token => {
    // Remove empty strings and very short tokens
    if (!token || token.length < 2) return false;
    // Remove stop words
    if (stopWords.has(token)) return false;
    return true;
  });

  return tokens;
}

/**
 * Normalizes a list of education requirement strings
 */
export function normalizeEducationRequirements(requirements) {
  if (!requirements || requirements.length === 0) {
    return [];
  }

  const allTokens = new Set();
  
  requirements.forEach(req => {
    const tokens = normalizeEducation(req);
    tokens.forEach(token => allTokens.add(token));
  });

  return Array.from(allTokens);
}

