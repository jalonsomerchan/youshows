export function joinPathSegments(...parts: string[]) {
  const cleanParts = parts
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);

  return `/${cleanParts.join('/')}${cleanParts.length ? '/' : ''}`;
}

export function getBasePath() {
  return import.meta.env.BASE_URL ?? '/';
}

export function withBasePath(path: string, basePath = getBasePath()) {
  const joinedPath = joinPathSegments(basePath, path);
  const lastSegment =
    path
      .replace(/[?#].*$/, '')
      .split('/')
      .filter(Boolean)
      .at(-1) ?? '';
  const isFilePath = /\.[a-z0-9]+$/i.test(lastSegment);

  return isFilePath ? joinedPath.replace(/\/$/, '') : joinedPath;
}

export function stripBasePath(pathname: string, basePath = getBasePath()) {
  const normalizedBase = joinPathSegments(basePath);

  if (normalizedBase === '/') {
    return pathname;
  }

  if (!pathname.startsWith(normalizedBase)) {
    return pathname;
  }

  return joinPathSegments(pathname.slice(normalizedBase.length));
}

export function getAbsoluteUrl(path: string, siteUrl: string) {
  return new URL(path, siteUrl).toString();
}
