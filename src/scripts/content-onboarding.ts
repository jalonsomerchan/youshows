import {
  completeContentOnboarding,
  getContentPreferences,
  isContentOnboardingComplete,
  type ContentPreferences,
} from './content-preferences';

type PreferenceGroup = 'languages' | 'ageRatings';

const dialog = document.querySelector<HTMLDialogElement>('[data-content-onboarding]');
const isStandalonePwa =
  window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

function getCheckboxes(group: PreferenceGroup): HTMLInputElement[] {
  return dialog
    ? [...dialog.querySelectorAll<HTMLInputElement>(`[data-onboarding-group="${group}"]`)]
    : [];
}

function syncForm(): void {
  const preferences = getContentPreferences();
  (['languages', 'ageRatings'] as const).forEach((group) => {
    const selection = preferences[group];
    getCheckboxes(group).forEach((checkbox) => {
      checkbox.checked = selection === null || selection.includes(checkbox.value as never);
    });
  });
}

function selectionFor(group: PreferenceGroup): string[] | null {
  const checkboxes = getCheckboxes(group);
  const selected = checkboxes.filter((checkbox) => checkbox.checked).map(({ value }) => value);
  return selected.length === checkboxes.length ? null : selected;
}

function hasSelection(group: PreferenceGroup): boolean {
  return getCheckboxes(group).some((checkbox) => checkbox.checked);
}

function showError(message = ''): void {
  const error = dialog?.querySelector<HTMLElement>('[data-onboarding-error]');
  if (error) error.textContent = message;
}

function showStep(step: PreferenceGroup): void {
  dialog?.querySelectorAll<HTMLElement>('[data-onboarding-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.onboardingPanel !== step;
  });
  const progress = dialog?.querySelector<HTMLElement>('[data-onboarding-progress]');
  if (progress) {
    progress.textContent =
      step === 'languages' ? dialog?.dataset.stepLanguages ?? '' : dialog?.dataset.stepAges ?? '';
  }
  showError();
}

function completeWithAllContent(): void {
  completeContentOnboarding({ version: 1, languages: null, ageRatings: null });
  dialog?.close();
}

function next(): void {
  if (!hasSelection('languages')) {
    showError(dialog?.dataset.languageRequired);
    return;
  }

  showStep('ageRatings');
  dialog?.querySelector<HTMLInputElement>('[data-onboarding-group="ageRatings"]')?.focus();
}

function complete(): void {
  if (!dialog || !hasSelection('ageRatings')) {
    showError(dialog?.dataset.ageRequired);
    return;
  }

  completeContentOnboarding({
    version: 1,
    languages: selectionFor('languages') as ContentPreferences['languages'],
    ageRatings: selectionFor('ageRatings') as ContentPreferences['ageRatings'],
  });
  dialog.close();
}

if (dialog && isStandalonePwa && !isContentOnboardingComplete()) {
  syncForm();
  showStep('languages');
  dialog.removeAttribute('aria-hidden');
  dialog.showModal();
  dialog.querySelector<HTMLInputElement>('[data-onboarding-group="languages"]')?.focus();
}

dialog?.addEventListener('change', () => showError());
dialog?.addEventListener('cancel', (event) => {
  event.preventDefault();
  completeWithAllContent();
});
dialog?.querySelector('[data-onboarding-close]')?.addEventListener('click', completeWithAllContent);
dialog
  ?.querySelectorAll('[data-onboarding-skip]')
  .forEach((button) => button.addEventListener('click', completeWithAllContent));
dialog?.querySelector('[data-onboarding-next]')?.addEventListener('click', next);
dialog?.querySelector('[data-onboarding-back]')?.addEventListener('click', () => showStep('languages'));
dialog?.querySelector('[data-onboarding-complete]')?.addEventListener('click', complete);
