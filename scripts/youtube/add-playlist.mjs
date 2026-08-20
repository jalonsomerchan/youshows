import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { inferEpisodeMeta, slugify } from './parse-title.mjs';
import { getPlaylist, getPlaylistItems, getVideoDetails } from './youtube-api.mjs';

const catalogPath = resolve('src/data/catalog.json');
const supportedLanguages = [
  'none',
  'es',
  'ca',
  'en',
  'eu',
  'gl',
  'fr',
  'pt',
  'it',
  'de',
  'ja',
  'other',
];
const supportedAgeRatings = ['none', 'all', '3', '7', '12', '16', '18'];
const args = parseArgs(process.argv.slice(2));
const playlistId = getPlaylistId(args.playlist);
const apiKey = process.env.YOUTUBE_API_KEY;

if (!playlistId)
  fail(
    'Uso: npm run playlist:add -- <URL-o-ID> [--id serie] [--title título] [--language es] [--age-rating all] [--tags "Uno,Dos"]'
  );
if (!apiKey) fail('Falta YOUTUBE_API_KEY. Añádela a tu entorno antes de importar la playlist.');

const [playlist, items] = await Promise.all([
  getPlaylist(playlistId, apiKey),
  getPlaylistItems(playlistId, apiKey),
]);
const videoDetails = await getVideoDetails(
  items.map((item) => item.contentDetails.videoId),
  apiKey
);
const playableItems = items.filter(
  (item) => videoDetails.get(item.contentDetails.videoId)?.embeddable
);
if (playableItems.length === 0)
  fail('La playlist no contiene vídeos públicos que permitan reproducción embebida.');
const seriesId = args.id ?? slugify(args.title ?? playlist.title);
const episodes = playableItems.map((item, index) => toEpisode(item, index + 1, videoDetails));
const seasons = groupBySeason(episodes);
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const existing = catalog.series.findIndex((series) => series.id === seriesId);
const previous = existing >= 0 ? catalog.series[existing] : undefined;
const image = bestThumbnail(playableItems[0]?.snippet?.thumbnails) ?? '';
const series = {
  id: seriesId,
  playlistId,
  title: args.title ?? previous?.title ?? playlist.title,
  description: args.description ?? previous?.description ?? playlist.description ?? '',
  year: Number(args.year ?? previous?.year ?? new Date().getFullYear()),
  genres: csv(args.genres ?? previous?.genres ?? 'YouTube'),
  tags: csv(args.tags ?? previous?.tags ?? ''),
  language: choice(args.language ?? previous?.language ?? 'none', supportedLanguages, 'idioma'),
  ageRating: choice(
    args['age-rating'] ??
      previous?.ageRating ??
      legacyAgeRating(args.maturity ?? previous?.maturity),
    supportedAgeRatings,
    'edad recomendada'
  ),
  featured: args.featured === undefined ? Boolean(previous?.featured) : args.featured === 'true',
  artwork: { poster: image, backdrop: image },
  seasons,
};

if (existing >= 0) catalog.series[existing] = series;
else catalog.series.push(series);

await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
const skipped = items.length - playableItems.length;
console.log(
  `${existing >= 0 ? 'Actualizada' : 'Añadida'} “${series.title}”: ${episodes.length} episodios en ${seasons.length} temporadas.${skipped ? ` ${skipped} vídeos no insertables omitidos.` : ''}`
);

function toEpisode(item, fallbackEpisode, videoDetails) {
  const videoId = item.contentDetails.videoId;
  const detected = inferEpisodeMeta(item.snippet.title, fallbackEpisode);
  return {
    id: `s${detected.season}-e${detected.episode}`,
    youtubeId: videoId,
    title: item.snippet.title,
    description: item.snippet.description ?? '',
    season: detected.season,
    episode: detected.episode,
    durationSeconds: videoDetails.get(videoId)?.duration ?? 0,
    thumbnail:
      bestThumbnail(item.snippet.thumbnails) ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt: item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt ?? '',
  };
}

function groupBySeason(episodes) {
  const grouped = new Map();
  for (const episode of episodes) {
    if (!grouped.has(episode.season)) grouped.set(episode.season, []);
    grouped.get(episode.season).push(episode);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([number, seasonEpisodes]) => ({
      number,
      title: `Temporada ${number}`,
      episodes: seasonEpisodes.sort((a, b) => a.episode - b.episode),
    }));
}

function bestThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url
  );
}

function getPlaylistId(value) {
  if (!value) return '';
  try {
    return new URL(value).searchParams.get('list') ?? '';
  } catch {
    return value.trim();
  }
}

function parseArgs(values) {
  const parsed = { playlist: values[0] };
  for (let index = 1; index < values.length; index += 2) {
    const key = values[index]?.replace(/^--/, '');
    if (key) parsed[key] = values[index + 1];
  }
  return parsed;
}

function csv(value) {
  return (Array.isArray(value) ? value : String(value).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

function legacyAgeRating(value) {
  if (!value || value === 'TP') return 'all';
  return String(value).replace(/^\+/, '');
}

function choice(value, choices, label) {
  const normalized = String(value);
  if (!choices.includes(normalized)) {
    fail(`Valor de ${label} no válido: “${normalized}”. Opciones: ${choices.join(', ')}.`);
  }
  return normalized;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
