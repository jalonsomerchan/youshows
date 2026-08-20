type FullscreenDocument = Pick<Document, 'fullscreenElement' | 'addEventListener' | 'removeEventListener'>;
type OrientationController = Pick<ScreenOrientation, 'lock' | 'unlock'>;

export function keepFullscreenLandscape(
  fullscreenDocument: FullscreenDocument = document,
  orientation: OrientationController | undefined = globalThis.screen?.orientation
) {
  if (!orientation || typeof orientation.lock !== 'function') return () => {};

  let changeId = 0;
  let locked = false;

  const unlock = () => {
    if (!locked) return;
    orientation.unlock();
    locked = false;
  };

  const syncOrientation = async () => {
    const currentChangeId = ++changeId;

    if (!fullscreenDocument.fullscreenElement) {
      unlock();
      return;
    }

    try {
      await orientation.lock('landscape');

      if (currentChangeId !== changeId || !fullscreenDocument.fullscreenElement) {
        orientation.unlock();
        return;
      }

      locked = true;
    } catch {
      // Orientation locking is optional and is rejected by unsupported browsers.
    }
  };

  fullscreenDocument.addEventListener('fullscreenchange', syncOrientation);

  return () => {
    changeId += 1;
    fullscreenDocument.removeEventListener('fullscreenchange', syncOrientation);
    unlock();
  };
}
