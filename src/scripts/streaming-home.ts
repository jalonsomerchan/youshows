import {
  CONTENT_PREFERENCES_EVENT,
  CONTENT_PREFERENCES_STORAGE_KEY,
  allowsContent,
  getContentPreferences,
} from './content-preferences';
import { initializeFeaturedCarousels, syncFeaturedCarousels } from './featured-carousel';
import {
  LIBRARY_EVENT,
  episodeKey,
  getLibrary,
  getResumeEpisodeId,
  toggleSeries,
} from './user-library';

const home = document.querySelector<HTMLElement>('[data-streaming-home]');
const search = home?.querySelector<HTMLInputElement>('#catalog-search');

if (home) initializeFeaturedCarousels(home);

function matchesPreferences(item: HTMLElement): boolean {
  return allowsContent(
    getContentPreferences(),
    item.dataset.seriesLanguage ?? 'none',
    item.dataset.seriesAgeRating ?? 'none'
  );
}

function updateHomeUi(): void {
  if (!home) return;
  const state = getLibrary();
  const query = search?.value.trim().toLocaleLowerCase() ?? '';

  home.querySelectorAll<HTMLElement>('[data-series-card]').forEach((card) => {
    const seriesId = card.dataset.seriesId ?? '';
    const episodeIds = JSON.parse(card.dataset.episodeIds ?? '[]') as string[];
    const saved = state.mySeries.includes(seriesId);
    const allowed = matchesPreferences(card);
    const button = card.querySelector<HTMLButtonElement>('[data-toggle-series]');
    if (button) {
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute(
        'aria-label',
        `${saved ? button.dataset.labelRemove : button.dataset.labelAdd} ${card.dataset.seriesTitle ?? ''}`
      );
    }

    const progressItems = episodeIds
      .map((id) => state.episodes[episodeKey(seriesId, id)])
      .filter(Boolean);
    const current = progressItems
      .filter((item) => !item.watched && item.progress > 5)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];

    let visible = allowed;
    if (card.classList.contains('library-card')) visible = visible && saved;
    if (card.classList.contains('continue-card')) visible = visible && Boolean(current);
    if (card.classList.contains('search-card')) {
      visible = visible && Boolean(query && card.dataset.searchValue?.includes(query));
    }
    card.hidden = !visible;

    const bar = card.querySelector<HTMLElement>('[data-card-progress]');
    if (bar) {
      bar.hidden = !current?.duration;
      if (current?.duration) {
        bar.style.setProperty(
          '--progress',
          `${Math.min(100, (current.progress / current.duration) * 100)}%`
        );
      }
    }
  });

  const libraryCount = home.querySelectorAll('.library-card:not([hidden])').length;
  const continueCount = home.querySelectorAll('.continue-card:not([hidden])').length;
  const searchCount = home.querySelectorAll('.search-card:not([hidden])').length;
  const catalogCount = home.querySelectorAll(
    '[data-catalog-list] [data-series-card]:not([hidden])'
  ).length;
  const librarySection = home.querySelector<HTMLElement>('[data-library-section]');
  const continueSection = home.querySelector<HTMLElement>('[data-continue-section]');
  const results = home.querySelector<HTMLElement>('[data-search-results]');
  const searchEmpty = home.querySelector<HTMLElement>('[data-search-empty]');
  const catalogEmpty = home.querySelector<HTMLElement>('[data-preferences-empty]');
  if (librarySection) librarySection.hidden = libraryCount === 0;
  if (continueSection) continueSection.hidden = continueCount === 0;
  if (results) results.hidden = !query;
  if (searchEmpty) searchEmpty.hidden = !query || searchCount > 0;
  if (catalogEmpty) catalogEmpty.hidden = catalogCount > 0;
  home.querySelectorAll<HTMLElement>('[data-preference-section]').forEach((section) => {
    section.hidden = !section.querySelector('[data-series-card]:not([hidden])');
  });

  const featuredSlides = Array.from(home.querySelectorAll<HTMLElement>('[data-featured-series]'));
  featuredSlides.forEach((slide) => {
    slide.dataset.featuredAllowed = String(matchesPreferences(slide));
  });
  syncFeaturedCarousels(home);
  const featuredVisible = featuredSlides.some((slide) => slide.dataset.featuredAllowed === 'true');
  home
    .querySelector('[data-home-content]')
    ?.classList.toggle('home-content--no-hero', !featuredVisible);

  home.querySelectorAll<HTMLAnchorElement>('[data-resume-series]').forEach((link) => {
    const seriesId = link.dataset.resumeSeries ?? '';
    const episodeIds = JSON.parse(link.dataset.episodeIds ?? '[]') as string[];
    const paths = JSON.parse(link.dataset.watchPaths ?? '{}') as Record<string, string>;
    const resumeId = getResumeEpisodeId(seriesId, episodeIds);
    if (resumeId && paths[resumeId]) link.href = paths[resumeId];
  });
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-toggle-series]');
  if (!button || !home?.contains(button)) return;
  toggleSeries(button.dataset.toggleSeries ?? '');
  updateHomeUi();
});

search?.addEventListener('input', updateHomeUi);
window.addEventListener(LIBRARY_EVENT, updateHomeUi);
window.addEventListener(CONTENT_PREFERENCES_EVENT, updateHomeUi);
window.addEventListener('storage', (event) => {
  if (event.key === CONTENT_PREFERENCES_STORAGE_KEY) updateHomeUi();
});

updateHomeUi();
