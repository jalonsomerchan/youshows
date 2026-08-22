import type { TranslationKey } from '../i18n/ui';

export const seriesLanguages = [
  'none',
  'es',
  'es-419',
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
] as const;

export const seriesAgeRatings = ['none', 'all', '3', '7', '12', '16', '18'] as const;

export type SeriesLanguage = (typeof seriesLanguages)[number];
export type SeriesAgeRating = (typeof seriesAgeRatings)[number];

export const languageFlagAssets: Partial<Record<SeriesLanguage, string>> = {
  es: 'language-flags/es.png',
  'es-419': 'language-flags/es.png',
  ca: 'language-flags/ca.png',
  en: 'language-flags/en.png',
  eu: 'language-flags/eu.png',
};

export function getLanguageFlagAsset(language: string | undefined): string | undefined {
  return languageFlagAssets[language as SeriesLanguage];
}

type Translator = (key: TranslationKey) => string;

const languageKeys: Record<SeriesLanguage, TranslationKey> = {
  none: 'metadata.language.none',
  es: 'metadata.language.es',
  'es-419': 'metadata.language.es-419',
  ca: 'metadata.language.ca',
  en: 'metadata.language.en',
  eu: 'metadata.language.eu',
  gl: 'metadata.language.gl',
  fr: 'metadata.language.fr',
  pt: 'metadata.language.pt',
  it: 'metadata.language.it',
  de: 'metadata.language.de',
  ja: 'metadata.language.ja',
  other: 'metadata.language.other',
};

const ageRatingKeys: Record<SeriesAgeRating, TranslationKey> = {
  none: 'metadata.age.none',
  all: 'metadata.age.all',
  '3': 'metadata.age.3',
  '7': 'metadata.age.7',
  '12': 'metadata.age.12',
  '16': 'metadata.age.16',
  '18': 'metadata.age.18',
};

export function getLanguageLabel(language: string | undefined, t: Translator): string {
  const code = seriesLanguages.includes(language as SeriesLanguage)
    ? (language as SeriesLanguage)
    : 'other';
  return t(languageKeys[code]);
}

export function getAgeRatingLabel(
  ageRating: string | undefined,
  legacyMaturity: string | undefined,
  t: Translator
): string {
  if (seriesAgeRatings.includes(ageRating as SeriesAgeRating)) {
    return t(ageRatingKeys[ageRating as SeriesAgeRating]);
  }
  if (legacyMaturity === 'TP') return t(ageRatingKeys.all);
  return legacyMaturity || t(ageRatingKeys.none);
}

export function getLegacyAgeRating(maturity: string | undefined): SeriesAgeRating {
  return maturity === 'TP' ? 'all' : 'none';
}
