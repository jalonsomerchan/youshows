import {
  seriesAgeRatings,
  seriesLanguages,
  type SeriesAgeRating,
  type SeriesLanguage,
} from '../config/series-metadata';

export const CONTENT_PREFERENCES_STORAGE_KEY = 'youshows.content-preferences.v1';
export const CONTENT_PREFERENCES_EVENT = 'youshows:content-preferences';

export interface ContentPreferences {
  version: 1;
  languages: SeriesLanguage[] | null;
  ageRatings: SeriesAgeRating[] | null;
}

const defaultPreferences = (): ContentPreferences => ({
  version: 1,
  languages: null,
  ageRatings: null,
});

function readSelection<T extends string>(
  value: unknown,
  allowedValues: readonly T[]
): T[] | null {
  if (value === null) return null;
  if (!Array.isArray(value)) return null;
  return [...new Set(value.filter((item): item is T => allowedValues.includes(item as T)))];
}

export function getContentPreferences(): ContentPreferences {
  try {
    const stored = localStorage.getItem(CONTENT_PREFERENCES_STORAGE_KEY);
    if (!stored) return defaultPreferences();
    const parsed = JSON.parse(stored) as Partial<ContentPreferences>;
    return {
      version: 1,
      languages: readSelection(parsed.languages, seriesLanguages),
      ageRatings: readSelection(parsed.ageRatings, seriesAgeRatings),
    };
  } catch {
    return defaultPreferences();
  }
}

export function saveContentPreferences(preferences: ContentPreferences): void {
  localStorage.setItem(CONTENT_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(CONTENT_PREFERENCES_EVENT, { detail: preferences }));
}

export function resetContentPreferences(): void {
  localStorage.removeItem(CONTENT_PREFERENCES_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(CONTENT_PREFERENCES_EVENT, { detail: defaultPreferences() })
  );
}

export function allowsContent(
  preferences: ContentPreferences,
  language: string,
  ageRating: string
): boolean {
  const languageAllowed =
    preferences.languages === null ||
    preferences.languages.includes(language as SeriesLanguage);
  const ageAllowed =
    preferences.ageRatings === null ||
    preferences.ageRatings.includes(ageRating as SeriesAgeRating);
  return languageAllowed && ageAllowed;
}
