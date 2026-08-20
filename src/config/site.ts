export const defaultLocale = 'es' as const;
export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
};

export const siteConfig = {
  name: 'YouShows',
  description: 'Tus series de YouTube, ordenadas y siempre a punto para continuar.',
  url: import.meta.env.ASTRO_SITE ?? 'https://jalonsomerchan.github.io',
  base: import.meta.env.ASTRO_BASE ?? '/',
  repositoryUrl:
    import.meta.env.PUBLIC_REPOSITORY_URL ?? 'https://github.com/jalonsomerchan/youshows',
  author: 'Jorge Alonso',
  defaultLocale,
  locales,
};

export type SiteConfig = typeof siteConfig;
