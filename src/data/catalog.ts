import { defaultLocale, type Locale } from '../config/site';
import type { SeriesAgeRating, SeriesLanguage } from '../config/series-metadata';
import catalogJson from './catalog.json';

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

export interface CatalogList {
  id: string;
  titles: Record<Locale, string>;
  seriesIds: string[];
}

export interface ResolvedCatalogList {
  id: string;
  title: string;
  series: Series[];
}

export interface Catalog {
  version: number;
  series: Series[];
  lists?: CatalogList[];
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

export function getLatestPublishedAt(series: Series): number {
  return series.seasons.reduce(
    (latestInSeries, season) =>
      season.episodes.reduce((latest, episode) => {
        const publishedAt = Date.parse(episode.publishedAt);
        return Number.isNaN(publishedAt) ? latest : Math.max(latest, publishedAt);
      }, latestInSeries),
    0
  );
}

export function getCatalogLists(locale: Locale): ResolvedCatalogList[] {
  const seriesById = new Map(catalog.series.map((series) => [series.id, series]));

  return (catalog.lists ?? [])
    .map((list) => ({
      id: list.id,
      title: list.titles[locale] ?? list.titles[defaultLocale] ?? '',
      series: list.seriesIds.flatMap((seriesId) => {
        const series = seriesById.get(seriesId);
        return series ? [series] : [];
      }),
    }))
    .filter((list) => list.title && list.series.length > 0);
}
