const seasonEpisodePatterns = [
  /\bS(?:eason)?\s*(\d{1,2})\s*[-_. ]*E(?:pisode|p(?:isode)?)?\s*(\d{1,3})\b/i,
  /\bT(?:emporada)?\s*(\d{1,2})\s*[-_. ]*(?:C(?:ap(?:ítulo|itulo)?)?|E(?:p(?:isodio)?)?)\s*(\d{1,3})\b/i,
  /\b(\d{1,2})\s*x\s*(\d{1,3})\b/i,
  /\b(?:Season|Temporada)\s*(\d{1,2}).*?(?:Episode|Episodio|Cap(?:ítulo|itulo)?)\s*(\d{1,3})\b/i,
];

const episodeOnlyPatterns = [
  /\b(?:Episodio|Episode|Ep\.?|Cap(?:ítulo|itulo)?\.?)\s*#?\s*(\d{1,3})\b/i,
  /^\s*#(\d{1,3})\b/,
];

export function inferEpisodeMeta(title, fallbackEpisode) {
  for (const pattern of seasonEpisodePatterns) {
    const match = title.match(pattern);
    if (match) return { season: Number(match[1]), episode: Number(match[2]), detected: true };
  }

  for (const pattern of episodeOnlyPatterns) {
    const match = title.match(pattern);
    if (match) return { season: 1, episode: Number(match[1]), detected: true };
  }

  return { season: 1, episode: fallbackEpisode, detected: false };
}

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}
