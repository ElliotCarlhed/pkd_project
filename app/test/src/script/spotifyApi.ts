import { getMoodById } from "./moodProfiles";

export async function createPlaylist(token: string, name: string, description: string, isPublic: boolean): Promise<string> {
    return fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            description,
            public: isPublic
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to create playlist: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        savePlaylistData(data);
        return data.id; 
    });
};

export async function getTracks(genres: Set<string>, length: number, token: string) {
    const lengthPer = Math.floor(length / genres.size);
    let remainder = length % genres.size;
    await Promise.all([...genres].map(async (element) => {
        const currentLength = lengthPer + (remainder-- > 0 ? 1 : 0);
        const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${element}&type=track&limit=${currentLength}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch tracks for genre ${element}: ${response.status}`);
        }
        const data = await response.json();
        saveTrackData(data.tracks.items.map((track: any) => simplefieGetTrack(track)));
    }));
    console.log('Tracks fetched and saved to localStorage');
};

function simplefieGetTrack(track: any): Track {
    return {
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({ id: artist.id, name: artist.name })),
        album: track.album.name,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        durationMs: track.duration_ms,
        imageUrl: track.album.images[0]?.url || '',
        uri: track.uri,
    }
};

const storedData = {
    track: 'spotify_track',
    artist: 'spotify_artist',
    playlist: 'spotify_playlist',
} as const;

const savePlaylistData = (data: any): void => {
  localStorage.setItem(storedData.playlist, JSON.stringify(data));
};

const saveTrackData = (data: any): void => {
    const existingData = getStoredTrack() || [];
    const combinedData = existingData.concat(data);
    localStorage.setItem(storedData.track, JSON.stringify(combinedData));
};

const clearTrackData = (): void => {
  localStorage.removeItem(storedData.track);
};

export const getStoredTrack = (): any | null => {
  const trackData = localStorage.getItem(storedData.track);
  if (trackData) {
    return JSON.parse(trackData);
  }
  return null;
};

export const getStoredPlaylist = (): string | null => {
    const playlistData = localStorage.getItem(storedData.playlist);
    if (playlistData) { 
        return JSON.parse(playlistData).id;
    }
    return null;
};


export async function addTracksToPlaylist(playlistId: string, trackUris: string[], token: string): Promise<string> {
    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: trackUris })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add tracks to playlist: ${response.status}`);
        }
        return response.json();
    });
    
};


function moodsToGenres(moods: Array<MoodProfile>): Set<string> {
    const genres: Set<string> = new Set();
    moods.forEach(mood => {
        mood.genres.forEach(genre => genres.add(genre));
    });
    return genres;
};

function shuffleTracks(): void {
    const tracks = getStoredTrack();
    clearTrackData();
    if (!tracks) return;
    for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    saveTrackData(tracks);
}

export function main(inputMoods: Array<string>, inputLength: number, token: string): void {
        const moodProfiles = inputMoods
            .map(moodName => getMoodById(moodName))
            .filter((mood): mood is MoodProfile => mood !== undefined);
        clearTrackData();
        const genres = moodsToGenres(moodProfiles);
        getTracks(genres, inputLength, token);
        //Todo: filter out excluded genres
        shuffleTracks();
}


    
