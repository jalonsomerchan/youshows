import { defaultLocale, siteConfig } from '../config/site';
import { useTranslations } from '../i18n/ui';
import { getBasePath, withBasePath } from '../utils/paths';

export function GET() {
  const t = useTranslations(defaultLocale);

  const manifest = {
    id: getBasePath(),
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: t('site.description'),
    start_url: getBasePath(),
    scope: getBasePath(),
    lang: defaultLocale,
    dir: 'ltr',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#0b0d14',
    theme_color: '#fb315c',
    categories: ['entertainment', 'kids'],
    icons: [
      {
        src: withBasePath('pwa-icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: withBasePath('pwa-icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
}
