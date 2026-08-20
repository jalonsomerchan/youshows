import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { keepFullscreenLandscape } from '../src/scripts/fullscreen-orientation.ts';

function createFullscreenDocument() {
  const listeners = new Set();

  return {
    fullscreenElement: null,
    addEventListener(event, listener) {
      if (event === 'fullscreenchange') listeners.add(listener);
    },
    removeEventListener(event, listener) {
      if (event === 'fullscreenchange') listeners.delete(listener);
    },
    dispatchFullscreenChange() {
      listeners.forEach((listener) => listener());
    },
    listenerCount() {
      return listeners.size;
    },
  };
}

describe('fullscreen landscape orientation', () => {
  it('locks in landscape while fullscreen and unlocks after leaving it', async () => {
    const fullscreenDocument = createFullscreenDocument();
    const lockCalls = [];
    let unlockCalls = 0;
    const orientation = {
      async lock(mode) {
        lockCalls.push(mode);
      },
      unlock() {
        unlockCalls += 1;
      },
    };
    const stop = keepFullscreenLandscape(fullscreenDocument, orientation);

    fullscreenDocument.fullscreenElement = {};
    fullscreenDocument.dispatchFullscreenChange();
    await Promise.resolve();

    assert.deepEqual(lockCalls, ['landscape']);
    assert.equal(unlockCalls, 0);

    fullscreenDocument.fullscreenElement = null;
    fullscreenDocument.dispatchFullscreenChange();
    assert.equal(unlockCalls, 1);

    stop();
    assert.equal(fullscreenDocument.listenerCount(), 0);
    assert.equal(unlockCalls, 1);
  });

  it('does nothing when orientation locking is unavailable', () => {
    const fullscreenDocument = createFullscreenDocument();
    const stop = keepFullscreenLandscape(fullscreenDocument, undefined);

    assert.equal(fullscreenDocument.listenerCount(), 0);
    assert.doesNotThrow(stop);
  });
});
