import catalogJson from './catalog.json';
import type { SeriesAgeRating, SeriesLanguage } from '../config/series-metadata';

export interface Episode {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  season: number;
  episode: number;
  durationSeconds: number;
  thumbnail: string;
  publishedAt: string;
}

export interface Season {
  number: number;
  title: string;
  episodes: Episode[];
}

export interface Series {
  id: string;
  playlistId: string;
  title: string;
  description: string;
  year: number;
  genres: string[];
  tags: string[];
  language: SeriesLanguage;
  ageRating: SeriesAgeRating;
  maturity?: string;
  featured?: boolean;
  artwork: { poster: string; backdrop: string };
  seasons: Season[];
}

export interface Catalog {
  version: number;
  series: Series[];
}

export const catalog = catalogJson as Catalog;

export function getEpisodes(series: Series): Episode[] {
  return series.seasons
    .flatMap((season) => season.episodes)
    .sort((a, b) => a.season - b.season || a.episode - b.episode);
}

export function getEpisode(series: Series, episodeId: string): Episode | undefined {
  return getEpisodes(series).find((episode) => episode.id === episodeId);
}

export function getNextEpisode(series: Series, episodeId: string): Episode | undefined {
  const episodes = getEpisodes(series);
  const currentIndex = episodes.findIndex((episode) => episode.id === episodeId);
  return currentIndex >= 0 ? episodes[currentIndex + 1] : undefined;
}
