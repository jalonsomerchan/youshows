import {
  completeContentOnboarding,
  getContentPreferences,
  isContentOnboardingComplete,
  type ContentPreferences,
} from './content-preferences';

type PreferenceGroup = 'languages' | 'ageRatings';

const dialog = document.querySelector<HTMLDialogElement>('[data-content-onboarding]');

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

function complete(): void {
  if (!dialog || !hasSelection('languages') || !hasSelection('ageRatings')) {
    showError(dialog?.dataset.selectionRequired);
    return;
  }

  completeContentOnboarding({
    version: 1,
    languages: selectionFor('languages') as ContentPreferences['languages'],
    ageRatings: selectionFor('ageRatings') as ContentPreferences['ageRatings'],
  });
  dialog.close();
}

if (dialog && !isContentOnboardingComplete()) {
  syncForm();
  dialog.showModal();
  dialog.querySelector<HTMLInputElement>('[data-onboarding-group="languages"]')?.focus();
}

dialog?.addEventListener('change', () => showError());
dialog?.addEventListener('cancel', (event) => event.preventDefault());
dialog?.querySelector('[data-onboarding-complete]')?.addEventListener('click', complete);
