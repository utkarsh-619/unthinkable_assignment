export function analyzeText(raw) {
  if (!raw || raw.trim().length === 0) {
    return { hashtags: [], topWords: [], suggestions: [] };
  }

  const text = raw.toLowerCase();

  // Extract hashtags
  const hashtags = [...text.matchAll(/#[a-z0-9_]+/gi)]
    .map(m => m[0])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  // Word frequency (stop-words removed)
  const stop = new Set(["the", "is", "are", "of", "and", "to", "a", "in", "for", "on"]);
  const words = text.replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(w => w && !stop.has(w) && w.length > 3);

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const topWords = Object.entries(freq)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10);

  // Suggested hashtags using top words
  const suggestions = topWords.map(([word]) => `#${word}`);

  return {
    hashtags: Object.entries(hashtags).sort((a,b)=>b[1]-a[1]),
    topWords,
    suggestions
  };
}
