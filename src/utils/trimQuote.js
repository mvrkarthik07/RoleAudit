/**
 * Trims resume/JD evidence snippets to the most relevant clause
 * Preserves meaning while reducing visual noise
 */
export function trimQuote(text, maxLength = 80) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Try to find a natural break point (sentence end, comma, etc.)
  const trimmed = text.substring(0, maxLength);
  
  // Look for sentence endings first
  const sentenceEnd = Math.max(
    trimmed.lastIndexOf('.'),
    trimmed.lastIndexOf('!'),
    trimmed.lastIndexOf('?')
  );
  
  if (sentenceEnd > maxLength * 0.6) {
    return text.substring(0, sentenceEnd + 1);
  }
  
  // Look for comma breaks
  const commaBreak = trimmed.lastIndexOf(',');
  if (commaBreak > maxLength * 0.6) {
    return text.substring(0, commaBreak) + '...';
  }
  
  // Look for clause breaks (conjunctions)
  const clauseBreaks = [' and ', ' or ', ' but ', ' with ', ' for ', ' to '];
  for (const breakWord of clauseBreaks) {
    const breakIndex = trimmed.lastIndexOf(breakWord);
    if (breakIndex > maxLength * 0.5) {
      return text.substring(0, breakIndex) + '...';
    }
  }
  
  // Fallback: trim at word boundary
  const wordBreak = trimmed.lastIndexOf(' ');
  if (wordBreak > maxLength * 0.5) {
    return text.substring(0, wordBreak) + '...';
  }
  
  return trimmed + '...';
}

