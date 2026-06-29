
export const stopWords = new Set([
  "a",
  "al",
  "ante",
  "con",
  "como",
  "de",
  "del",
  "el",
  "en",
  "es",
  "esta",
  "este",
  "la",
  "las",
  "lo",
  "los",
  "para",
  "por",
  "que",
  "se",
  "sin",
  "sobre",
  "su",
  "un",
  "una",
  "y"
]);

export const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const tokenize = (value: string) =>
  normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !stopWords.has(token));

export const extractBestSnippet = (text: string, tokens: string[]) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return text.slice(0, 220).trim();
  }

  let bestSentence = sentences[0] ?? text;
  let bestScore = -1;

  for (const sentence of sentences) {
    const normalizedSentence = normalizeText(sentence);
    const score = tokens.reduce((total, token) => total + (normalizedSentence.includes(token) ? 1 : 0), 0);

    if (score > bestScore) {
      bestSentence = sentence;
      bestScore = score;
    }
  }

  return bestSentence.length > 220 ? `${bestSentence.slice(0, 217).trim()}...` : bestSentence;
};