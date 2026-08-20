import type { Locale } from '../config/site';
import { getLocalizedPath } from '../i18n/ui';

export function getSeriesPath(seriesId: string, locale: Locale) {
  return getLocalizedPath(`series/${seriesId}`, locale);
}

export function getWatchPath(seriesId: string, episodeId: string, locale: Locale) {
  return getLocalizedPath(`watch/${seriesId}/${episodeId}`, locale);
}
