const STORAGE_KEY = 'youshows.library.v1';

export interface EpisodeProgress {
  progress: number;
  duration: number;
  watched: boolean;
  updatedAt: number;
}

export interface LibraryState {
  version: 1;
  mySeries: string[];
  episodes: Record<string, EpisodeProgress>;
}

function emptyState(): LibraryState {
  return { version: 1, mySeries: [], episodes: {} };
}

export function episodeKey(seriesId: string, episodeId: string) {
  return `${seriesId}:${episodeId}`;
}

export function getLibrary(): LibraryState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyState();
    const parsed = JSON.parse(stored) as Partial<LibraryState>;
    return {
      version: 1,
      mySeries: Array.isArray(parsed.mySeries) ? parsed.mySeries : [],
      episodes: parsed.episodes && typeof parsed.episodes === 'object' ? parsed.episodes : {},
    };
  } catch {
    return emptyState();
  }
}

function persist(state: LibraryState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('youshows:library', { detail: state }));
}

export function toggleSeries(seriesId: string): boolean {
  const state = getLibrary();
  const isSaved = state.mySeries.includes(seriesId);
  state.mySeries = isSaved
    ? state.mySeries.filter((id) => id !== seriesId)
    : [...state.mySeries, seriesId];
  persist(state);
  return !isSaved;
}

export function saveProgress(
  seriesId: string,
  episodeId: string,
  progress: number,
  duration: number,
  forceWatched = false
) {
  const state = getLibrary();
  const key = episodeKey(seriesId, episodeId);
  const safeDuration = Math.max(0, Math.round(duration));
  const safeProgress = Math.max(0, Math.min(Math.round(progress), safeDuration || progress));
  state.episodes[key] = {
    progress: safeProgress,
    duration: safeDuration,
    watched: forceWatched || (safeDuration > 0 && safeProgress / safeDuration >= 0.92),
    updatedAt: Date.now(),
  };
  persist(state);
}

export function getResumeEpisodeId(seriesId: string, episodeIds: string[]): string | undefined {
  const state = getLibrary();
  const inProgress = episodeIds
    .map((id) => ({ id, state: state.episodes[episodeKey(seriesId, id)] }))
    .filter(({ state: progress }) => progress && !progress.watched && progress.progress > 5)
    .sort((a, b) => b.state.updatedAt - a.state.updatedAt)[0];

  if (inProgress) return inProgress.id;
  return (
    episodeIds.find((id) => !state.episodes[episodeKey(seriesId, id)]?.watched) ?? episodeIds[0]
  );
}
