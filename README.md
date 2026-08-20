# Alon Kids

Experiencia de streaming estática construida con Astro para convertir playlists de YouTube en series con temporadas, episodios y reproducción continua. Está diseñada mobile first, funciona en modo claro y oscuro y no necesita backend para el catálogo ni para guardar la actividad del usuario.

## Funcionalidades

- Portada tipo plataforma de streaming con contenido destacado, buscador y carruseles táctiles.
- Ficha de cada serie con selector de temporadas y lista de episodios.
- Reproductor basado en la YouTube IFrame API con salto automático al siguiente episodio.
- “Mi lista”, progreso, capítulo pendiente y episodios vistos guardados en `localStorage`.
- Playlist Studio local para importar playlists y editar o eliminar series y capítulos, también de forma masiva, con idioma, edad recomendada, descripción y tags.
- Detección automática de patrones de temporada/capítulo en español e inglés.
- Omisión automática de vídeos privados o que no permiten reproducción embebida.
- Rutas estáticas en español (`/`) e inglés (`/en/`).
- Compatibilidad con dominio raíz, subruta y GitHub Pages.
- PWA instalable con funcionamiento offline para páginas y recursos visitados.
- SEO técnico, sitemap, manifest, robots, service worker y tests smoke.

## Requisitos

- Node.js 22 (consulta `.nvmrc`).
- Una clave de YouTube Data API v3 solo para importar playlists. No es necesaria para servir o reproducir el sitio.

```sh
nvm use
npm ci
npm run dev
```

## Comandos

| Comando                       | Acción                                           |
| ----------------------------- | ------------------------------------------------ |
| `npm run dev`                 | Inicia Astro en desarrollo.                      |
| `npm run build`               | Genera la web estática en `dist/`.               |
| `npm run preview`             | Sirve el build local.                            |
| `npm test`                    | Ejecuta tests smoke y del detector de episodios. |
| `npm run playlist:ui`         | Inicia el administrador visual local.            |
| `npm run playlist:add -- URL` | Importa o actualiza una playlist.                |
| `npm run format`              | Formatea los ficheros compatibles.               |
| `npm run clean`               | Borra `dist` y `.astro`.                         |

## Añadir una serie desde YouTube

La opción más cómoda es arrancar la interfaz local y abrir la dirección que muestra:

```sh
npm run playlist:ui
```

La interfaz está en `.local/playlist-admin/` y Git la ignora, por lo que no se publica junto a la web. Desde ella también puedes modificar el idioma, la edad recomendada, la descripción, los tags y el resto de metadatos; filtrar y seleccionar episodios; renumerar o mover temporadas; y hacer eliminaciones masivas.

También puedes exportar la clave en tu terminal y ejecutar el importador:

```sh
export YOUTUBE_API_KEY="tu-clave"
npm run playlist:add -- "https://www.youtube.com/playlist?list=PLAYLIST_ID" \
  --title "Título de la serie" \
  --genres "Documental,Tecnología" \
  --featured true
```

El resultado se escribe en `src/data/catalog.json`. El importador entiende títulos como `S02E04`, `2x04`, `Temporada 2 Capítulo 4` y `Season 2 Episode 4`. Consulta [docs/catalog-guide.md](docs/catalog-guide.md) para ver todas las opciones, el modelo de datos y las reglas de identificación.

## Estructura principal

```text
src/
├── components/
│   ├── StreamingHome.astro
│   ├── SeriesDetail.astro
│   ├── YouTubePlayer.astro
│   ├── ShowCard.astro
│   └── EpisodeCard.astro
├── data/
│   ├── catalog.json
│   └── catalog.ts
├── scripts/
│   └── user-library.ts
├── pages/
│   ├── series/[slug].astro
│   ├── watch/[series]/[episode].astro
│   └── [locale]/...
└── i18n/translations/
    ├── es.json
    └── en.json

scripts/youtube/
├── add-playlist.mjs
├── parse-title.mjs
└── youtube-api.mjs

public/
├── sw.js
├── pwa-icon-192.png
└── pwa-icon-512.png
```

## Persistencia y privacidad

Las series guardadas, los segundos reproducidos y los episodios vistos permanecen únicamente en el `localStorage` del navegador. No hay cuenta ni sincronización entre dispositivos. Playlist Studio también conserva la clave de YouTube en el `localStorage` de su origen local para reutilizarla; solo la envía al importador local y nunca debe exponerse con un prefijo `PUBLIC_` ni incluirse en el build público.

## Traducciones e idiomas

La interfaz usa el i18n nativo de Astro y los JSON de `src/i18n/translations/`. Cualquier clave de UI nueva debe añadirse en todos los idiomas configurados en `src/config/site.ts`.

El contenido importado conserva el título y la descripción de YouTube. Si se necesitan metadatos editoriales distintos por idioma, se pueden editar manualmente en el catálogo o mantener series específicas por idioma.

## GitHub Pages y subrutas

La configuración calcula `base` automáticamente en GitHub Actions. También se puede comprobar localmente:

```sh
ASTRO_SITE=https://usuario.github.io ASTRO_BASE=/alon-kids npm run build
```

Los enlaces internos, el manifest y el service worker respetan `BASE_URL`, por lo que funcionan tanto en `/` como en `/alon-kids/`.

## PWA y modo offline

El build de producción registra `public/sw.js` dentro del ámbito real de `BASE_URL`. La portada se guarda al instalar la PWA y las páginas, scripts, estilos e imágenes del mismo origen se almacenan al visitarlos. Si se pierde la conexión, una navegación intenta mostrar su versión guardada y usa la portada como fallback.

El service worker no se registra durante `npm run dev`, evitando cachés persistentes mientras se desarrolla. Al cambiar su estrategia o los recursos críticos, incrementa la versión de `CACHE_NAME` en `public/sw.js`.

## Verificación

Antes de desplegar:

```sh
npm test
npm run build
```

La CI y el workflow de GitHub Pages ejecutan ambos comandos.

## Documentación para agentes IA

Antes de modificar el proyecto, lee `agents.md` y las guías de `docs/`, especialmente:

- `docs/catalog-guide.md` para catálogo, importación y progreso.
- `docs/design-system.md` para UI, responsive, accesibilidad y temas.
- `docs/i18n-guide.md` para traducciones.
- `docs/github-pages.md` para rutas y despliegues en subcarpeta.
- `docs/testing-guide.md` para mantener tests smoke útiles.
