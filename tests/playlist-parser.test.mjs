import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { inferEpisodeMeta, slugify } from '../scripts/youtube/parse-title.mjs';

describe('YouTube playlist title parser', () => {
  it('detects common season and episode formats', () => {
    assert.deepEqual(inferEpisodeMeta('Mi serie S02E04', 1), {
      season: 2,
      episode: 4,
      detected: true,
    });
    assert.deepEqual(inferEpisodeMeta('Mi serie 3x07', 1), {
      season: 3,
      episode: 7,
      detected: true,
    });
    assert.deepEqual(inferEpisodeMeta('Temporada 2 - Capítulo 5', 1), {
      season: 2,
      episode: 5,
      detected: true,
    });
    assert.deepEqual(inferEpisodeMeta('Episode 8: The ending', 1), {
      season: 1,
      episode: 8,
      detected: true,
    });
  });

  it('falls back to playlist order and produces safe ids', () => {
    assert.deepEqual(inferEpisodeMeta('A title without numbering', 6), {
      season: 1,
      episode: 6,
      detected: false,
    });
    assert.equal(slugify('Érase una vez: Temporada 1'), 'erase-una-vez-temporada-1');
  });
});
