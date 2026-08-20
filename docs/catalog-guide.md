# Catálogo e importación de playlists

YouShows genera todas sus páginas de forma estática desde `src/data/catalog.json`. El navegador solo recibe los metadatos necesarios y guarda la biblioteca personal en `localStorage`; ninguna clave de YouTube se publica en el frontend.

## Importar una playlist

### Interfaz visual local

La forma recomendada en esta instalación es iniciar el administrador visual:

```sh
npm run playlist:ui
```

Después abre `http://127.0.0.1:4310`. Playlist Studio permite importar y administrar el catálogo sin editar JSON ni usar argumentos de terminal.

El editor incluye:

- Edición y eliminación de series, incluidos título, descripción, géneros, tags, idioma, edad recomendada, año e imágenes.
- Edición individual de título, descripción, temporada, número, vídeo de YouTube y miniatura de cada capítulo.
- Filtros por serie, temporada y texto, además de selección de todos los capítulos visibles.
- Cambios masivos para buscar y reemplazar títulos, mover capítulos de temporada, renumerarlos y asignar una descripción común.
- Eliminación masiva con confirmación. Para evitar un catálogo inválido, la herramienta no permite borrar todos los capítulos de una serie; en ese caso debe eliminarse la serie completa.

Los cambios conservan los identificadores internos de series y capítulos, de modo que las URLs y el progreso guardado en el navegador siguen asociados al contenido. Cada escritura de `catalog.json` se hace mediante un fichero temporal y un reemplazo atómico.

La interfaz vive en `.local/playlist-admin/`, está incluida en `.gitignore` y no forma parte del build de Astro ni de GitHub Pages. Solo escucha en `127.0.0.1`. Para evitar copiarla en cada uso, la clave se conserva en el `localStorage` de ese navegador y origen local; solo se envía al servidor local durante una importación y no se incorpora al catálogo ni al build público.

### Importación por terminal

1. Crea una clave de YouTube Data API v3 en Google Cloud.
2. Expórtala únicamente en tu terminal:

```sh
export YOUTUBE_API_KEY="tu-clave"
```

3. Ejecuta el importador con la URL o el ID de la playlist:

```sh
npm run playlist:add -- "https://www.youtube.com/playlist?list=PLAYLIST_ID"
```

El script pagina la playlist completa, consulta la duración real, omite vídeos que no permiten reproducción embebida y actualiza `src/data/catalog.json`. Si se vuelve a importar el mismo `--id`, reemplaza esa serie sin duplicarla.

Opciones disponibles:

```sh
npm run playlist:add -- PLAYLIST_ID \
  --id mi-serie \
  --title "Mi serie" \
  --description "Descripción del catálogo" \
  --genres "Documental,Tecnología" \
  --tags "historia,entrevistas" \
  --language es \
  --age-rating all \
  --year 2026 \
  --featured true
```

No escribas la clave en `.env.example`, `catalog.json`, commits, issues ni código cliente.

## Detección de temporadas y episodios

El importador reconoce automáticamente estas convenciones en el título del vídeo:

- `S02E04` y `S2 E4`.
- `2x04`.
- `Temporada 2 Capítulo 4`.
- `T2 E4`.
- `Season 2 Episode 4`.
- `Episode 4`, `Episodio 4`, `Capítulo 4` o `Ep. 4` (temporada 1).

Cuando un título no contiene numeración reconocible se asigna a la temporada 1 y conserva su posición en la playlist. El JSON se puede ajustar manualmente después de importarlo.

## Modelo de datos

Cada serie contiene descripción, arte, géneros, tags, idioma, edad recomendada y una lista de temporadas. `language` utiliza códigos estables como `es`, `ca`, `en` o `none`; `ageRating` admite `all`, `3`, `7`, `12`, `16`, `18` o `none`. Las etiquetas visibles se traducen en la interfaz.

Cada episodio conserva un `youtubeId`, duración, miniatura, título, descripción y números de temporada/episodio. Los identificadores `series.id` deben ser slugs estables porque forman parte de las URLs y de las claves guardadas en el navegador.

El campo antiguo `maturity` se sigue interpretando al leer catálogos anteriores. Al guardar una serie desde Playlist Studio se migra automáticamente al campo estructurado `ageRating`.

Si se cambia un `series.id` o `episode.id`, el progreso local anterior dejará de asociarse con ese contenido.

## Reproducción y datos locales

`src/scripts/user-library.ts` mantiene una única estructura versionada en `localStorage` con:

- Series guardadas en “Mi lista”.
- Segundo de reproducción y duración de cada episodio.
- Estado visto cuando se supera el 92 % o termina el vídeo.
- Fecha de actualización para elegir el episodio que debe retomarse.

El reproductor guarda cada cinco segundos, restaura el punto anterior y, al terminar, abre automáticamente el siguiente episodio de la temporada o serie. Estos datos pertenecen a cada navegador y dispositivo; no se sincronizan con una cuenta.

Las preferencias del catálogo se guardan por separado en `youshows.content-preferences.v1`. El panel de ajustes permite elegir los idiomas y clasificaciones de edad visibles; el filtro se aplica al catálogo, la búsqueda, “Mi lista”, “Seguir viendo” y la serie destacada. Seleccionar todas las opciones equivale al comportamiento predeterminado y las preferencias se pueden restablecer desde el mismo panel.
