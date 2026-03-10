/**
 * Makes spotify play audio from current open browser. 
 * 
 * @param deviceId 
 * A unique ID given for the browser player
 * 
 */
export async function transferPlayback(accessToken: string | null, deviceId: string) {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`transferPlayback failed: ${res.status} ${text}`);
  }
}

export async function playUri(accessToken: string | null, deviceId: string, uri: string) {
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [uri],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`playUri failed: ${res.status} ${text}`);
  }
}