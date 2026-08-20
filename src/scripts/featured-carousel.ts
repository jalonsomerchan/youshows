interface CarouselState {
  activeSeriesId?: string;
  touchStart?: { x: number; y: number };
}

const carouselStates = new WeakMap<HTMLElement, CarouselState>();

function getSlides(carousel: HTMLElement): HTMLElement[] {
  return Array.from(carousel.querySelectorAll<HTMLElement>('[data-featured-series]'));
}

function getAllowedSlides(carousel: HTMLElement): HTMLElement[] {
  return getSlides(carousel).filter((slide) => slide.dataset.featuredAllowed !== 'false');
}

function showSlide(carousel: HTMLElement, seriesId: string, announce = false): void {
  const allowedSlides = getAllowedSlides(carousel);
  const activeSlide =
    allowedSlides.find((slide) => slide.dataset.seriesId === seriesId) ?? allowedSlides[0];
  const activeSeriesId = activeSlide?.dataset.seriesId;
  const state = carouselStates.get(carousel) ?? {};
  state.activeSeriesId = activeSeriesId;
  carouselStates.set(carousel, state);

  getSlides(carousel).forEach((slide) => {
    slide.hidden = slide !== activeSlide;
  });

  carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]').forEach((dot) => {
    const isAllowed = allowedSlides.some(
      (slide) => slide.dataset.seriesId === dot.dataset.carouselDot
    );
    dot.hidden = !isAllowed;
    if (dot.dataset.carouselDot === activeSeriesId) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });

  const controls = carousel.querySelector<HTMLElement>('[data-carousel-controls]');
  if (controls) controls.hidden = allowedSlides.length < 2;

  const currentIndex = Math.max(0, allowedSlides.indexOf(activeSlide));
  const count = carousel.querySelector<HTMLElement>('[data-carousel-count]');
  if (count) count.textContent = `${currentIndex + 1} / ${allowedSlides.length}`;

  if (announce && activeSlide) {
    const status = carousel.querySelector<HTMLElement>('[data-carousel-status]');
    if (status) status.textContent = activeSlide.dataset.seriesTitle ?? '';
  }
}

function move(carousel: HTMLElement, direction: -1 | 1): void {
  const slides = getAllowedSlides(carousel);
  if (slides.length < 2) return;
  const state = carouselStates.get(carousel) ?? {};
  const currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.dataset.seriesId === state.activeSeriesId)
  );
  const nextIndex = (currentIndex + direction + slides.length) % slides.length;
  showSlide(carousel, slides[nextIndex].dataset.seriesId ?? '', true);
}

function initializeCarousel(carousel: HTMLElement): void {
  if (carouselStates.has(carousel)) return;
  carouselStates.set(carousel, {});

  carousel.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-carousel-previous]')) move(carousel, -1);
    if (target.closest('[data-carousel-next]')) move(carousel, 1);
    const dot = target.closest<HTMLButtonElement>('[data-carousel-dot]');
    if (dot?.dataset.carouselDot) showSlide(carousel, dot.dataset.carouselDot, true);
  });

  carousel.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const state = carouselStates.get(carousel) ?? {};
      state.touchStart = { x: touch.clientX, y: touch.clientY };
      carouselStates.set(carousel, state);
    },
    { passive: true }
  );

  carousel.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches[0];
      const state = carouselStates.get(carousel);
      if (!touch || !state?.touchStart) return;
      const horizontalDistance = touch.clientX - state.touchStart.x;
      const verticalDistance = touch.clientY - state.touchStart.y;
      state.touchStart = undefined;
      if (
        Math.abs(horizontalDistance) < 50 ||
        Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
      )
        return;
      move(carousel, horizontalDistance < 0 ? 1 : -1);
    },
    { passive: true }
  );

  const firstSlide = getAllowedSlides(carousel)[0];
  showSlide(carousel, firstSlide?.dataset.seriesId ?? '');
}

export function initializeFeaturedCarousels(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-featured-carousel]').forEach(initializeCarousel);
}

export function syncFeaturedCarousels(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-featured-carousel]').forEach((carousel) => {
    const state = carouselStates.get(carousel);
    showSlide(carousel, state?.activeSeriesId ?? '');
  });
}
