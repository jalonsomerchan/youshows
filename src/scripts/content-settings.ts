import {
  CONTENT_PREFERENCES_EVENT,
  CONTENT_PREFERENCES_STORAGE_KEY,
  getContentPreferences,
  restartContentOnboarding,
  resetContentPreferences,
  saveContentPreferences,
  type ContentPreferences,
} from './content-preferences';

type PreferenceGroup = 'languages' | 'ageRatings';

const dialog = document.querySelector<HTMLDialogElement>('[data-content-settings]');

function getCheckboxes(group: PreferenceGroup): HTMLInputElement[] {
  return dialog
    ? [...dialog.querySelectorAll<HTMLInputElement>(`[data-preference-group="${group}"]`)]
    : [];
}

function syncForm(preferences = getContentPreferences()): void {
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

function persistForm(): void {
  saveContentPreferences({
    version: 1,
    languages: selectionFor('languages') as ContentPreferences['languages'],
    ageRatings: selectionFor('ageRatings') as ContentPreferences['ageRatings'],
  });
  const status = dialog?.querySelector<HTMLElement>('[data-settings-status]');
  if (status) status.textContent = status.dataset.savedLabel ?? '';
}

document.addEventListener('click', (event) => {
  const target = event.target as Element;
  if (target.closest('[data-settings-open]')) {
    syncForm();
    dialog?.showModal();
    return;
  }
  if (target.closest('[data-settings-close]')) {
    dialog?.close();
    return;
  }
  if (target.closest('[data-settings-reset]')) {
    resetContentPreferences();
    syncForm();
    return;
  }
  if (target.closest('[data-settings-restart-onboarding]')) {
    dialog?.close();
    restartContentOnboarding();
    return;
  }

  const groupAction = target.closest<HTMLButtonElement>('[data-settings-group-action]');
  if (!groupAction) return;
  const group = groupAction.dataset.settingsGroupAction as PreferenceGroup;
  const checked = groupAction.dataset.settingsChecked === 'true';
  getCheckboxes(group).forEach((checkbox) => {
    checkbox.checked = checked;
  });
  persistForm();
});

dialog?.addEventListener('change', persistForm);

window.addEventListener(CONTENT_PREFERENCES_EVENT, () => syncForm());
window.addEventListener('storage', (event) => {
  if (event.key === CONTENT_PREFERENCES_STORAGE_KEY) syncForm();
});

syncForm();
