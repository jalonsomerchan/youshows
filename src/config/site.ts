export const defaultLocale = 'es' as const;
export const locales = ['es', 'en', 'ca', 'eu'] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  ca: 'Català',
  eu: 'Euskara',
};

export const localeFlags: Record<Locale, string> = {
  es: 'language-flags/es.png',
  en: 'language-flags/en.png',
  ca: 'language-flags/ca.png',
  eu: 'language-flags/eu.png',
};

export const siteConfig = {
  name: 'Alon Kids',
  description: 'Las series favoritas de los peques, ordenadas y listas para continuar.',
  url: import.meta.env.ASTRO_SITE ?? 'https://jalonsomerchan.github.io',
  base: import.meta.env.ASTRO_BASE ?? '/',
  repositoryUrl:
    import.meta.env.PUBLIC_REPOSITORY_URL ?? 'https://github.com/jalonsomerchan/alon-kids',
  author: 'Jorge Alonso',
  defaultLocale,
  locales,
};

export type SiteConfig = typeof siteConfig;
