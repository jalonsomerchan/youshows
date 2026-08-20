const API_BASE = 'https://www.googleapis.com/youtube/v3';

async function request(resource, params, apiKey) {
  const url = new URL(`${API_BASE}/${resource}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload?.error?.message ?? `YouTube API respondió ${response.status}`);
  return payload;
}

export async function getPlaylist(playlistId, apiKey) {
  const payload = await request('playlists', { part: 'snippet', id: playlistId }, apiKey);
  const playlist = payload.items?.[0];
  if (!playlist) throw new Error(`No se encontró la playlist ${playlistId}`);
  return playlist.snippet;
}

export async function getPlaylistItems(playlistId, apiKey) {
  const items = [];
  let pageToken;
  do {
    const payload = await request(
      'playlistItems',
      { part: 'snippet,contentDetails', playlistId, maxResults: 50, pageToken },
      apiKey
    );
    items.push(...(payload.items ?? []));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return items.filter(
    (item) => item.contentDetails?.videoId && item.snippet?.title !== 'Deleted video'
  );
}

export async function getVideoDetails(videoIds, apiKey) {
  const details = new Map();
  for (let index = 0; index < videoIds.length; index += 50) {
    const ids = videoIds.slice(index, index + 50);
    const payload = await request(
      'videos',
      { part: 'contentDetails,status', id: ids.join(',') },
      apiKey
    );
    for (const item of payload.items ?? []) {
      details.set(item.id, {
        duration: parseDuration(item.contentDetails.duration),
        embeddable: item.status?.embeddable === true,
        privacyStatus: item.status?.privacyStatus,
      });
    }
  }
  return details;
}

function parseDuration(value = 'PT0S') {
  const match = value.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    Number(match[1] ?? 0) * 86400 +
    Number(match[2] ?? 0) * 3600 +
    Number(match[3] ?? 0) * 60 +
    Number(match[4] ?? 0)
  );
}
