import { getMoodById } from "./moodProfiles";
import { genresAll } from "./genresArray";
import { stringify } from "querystring";

/**
 * Creates a new Spotify playlist for the authenticated user.
 * @example
 * // creates a public playlist called "Chill Vibes"
 * const id = await createPlaylist(token, "Chill Vibes", "Relaxing tracks", true);
 * @param {string} token - Spotify OAuth Bearer token.
 * @param {string} name - Name of the playlist.
 * @param {string} description - Description text for the playlist.
 * @param {boolean} isPublic - Whether the playlist is publicly visible.
 * @precondition token is a valid, non-expired Spotify OAuth token.
 * @sideeffect Saves the full playlist response to localStorage.
 * @throws Error if the Spotify API responds with a non-OK status.
 * @return {Promise<string>} Resolves when the playlist is created and data is saved.
 */
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
        return response;
    }).then(async response => {
        const data = await response.json();
        savePlaylistData(data);
        return data.id;
    });
};




/**
 * Fetches tracks from the Spotify search API for each genre, distributing the
 * total count evenly across genres with the remainder given to the first genres.
 * @example
 * // fetches 10 tracks total across genres "pop" and "rock"
 * await getTracks(new Set(["pop", "rock"]), 10, token);
 * @param {Set<string>} genres - Set of genre strings to search for.
 * @param {number} length - Total number of tracks to fetch across all genres.
 * @param {string} token - Spotify OAuth Bearer token.
 * @precondition genres is not empty. length is a positive integer. token is valid.
 * @sideeffect Appends simplified track data to localStorage.
 * @throws Error if any genre's fetch request fails.
 * @complexity O(n) API calls where n is the number of genres, executed concurrently.
 * @returns {Promise<void>}
 */
export async function getTracks(genres: Set<string>, length: number, token: string): Promise<void> {
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


/**
 * Transforms a raw Spotify track object into a simplified Track object.
 * @example
 * // returns { id: "abc", name: "Song", artists: [...], ... }
 * const track = simplefieGetTrack(rawSpotifyTrackObject);
 * @param {any} track - A raw track object from the Spotify API response.
 * @precondition track contains the fields: id, name, artists, album, preview_url,
 *              external_urls.spotify, duration_ms, uri.
 * @returns {Track} A simplified Track object with only the relevant fields.
 */
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

// Saves the playlist id to localStorage.
const savePlaylistData = (data: any): void => {
  localStorage.setItem(storedData.playlist, JSON.stringify(data));
};

 // Appends an array of track data to the existing track array in localStorage.
 // If no existing data is found, starts a new array.
const saveTrackData = (data: any): void => {
    const existingData = getStoredTrack() || [];
    const combinedData = existingData.concat(data);
    localStorage.setItem(storedData.track, JSON.stringify(combinedData));
};


// Clears the stored track data from localStorage.
const clearTrackData = (): void => {
  localStorage.removeItem(storedData.track);
};

// Retrieves the stored track data array from localStorage, or null if not found.
export const getStoredTrack = (): any | null => {
  const trackData = localStorage.getItem(storedData.track);
  if (trackData) {
    return JSON.parse(trackData);
  }
  return null;
};

// Retrieves the stored playlist ID from localStorage, or null if not found.
export const getStoredPlaylist = (): string | null => {
    const playlistData = localStorage.getItem(storedData.playlist);
    if (playlistData) { 
        return JSON.parse(playlistData).id;
    }
    return null;
};

/**
 * Adds an array of tracks to an existing Spotify playlist.
 * @example
 * await addTracksToPlaylist("3cEYp...", ["spotify:track:4iV5W..."], token);
 * @param {string} playlistId - The base62 Spotify playlist ID (not a URI or URL).
 * @param {string[]} trackUris - Array of Spotify track URIs in the format "spotify:track:{id}".
 * @param {string} token - Spotify OAuth Bearer token.
 * @precondition playlistId is a valid base62 Spotify ID. trackUris contains valid
 *              Spotify track URIs. trackUris.length <= 100 (Spotify API limit per request).
 * @throws Error if the Spotify API responds with a non-OK status.
 * @returns {Promise<string>} The API response as JSON.
 */
export async function addTracksToPlaylist(playlistId: string, trackUris: string[], token: string): Promise<void> {
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: trackUris })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add tracks to playlist: ${response.status}`);
        }
    });
    
};


/**
 * Extracts and deduplicates all genre strings from an array of MoodProfile objects.
 * @example
 * // given moods with genres ["pop", "rock"] and ["rock", "jazz"]
 * // returns Set(["pop", "rock", "jazz"])
 * const genres = moodsToGenres(moodProfiles);
 * @param {Array<MoodProfile>} moods - Array of MoodProfile objects, each containing a genres array.
 * @precondition Each MoodProfile has a genres property that is an iterable of strings.
 * @returns {Set<string>} A set of unique genre names.
 */
function moodsToGenres(moods: Array<MoodProfile>): Set<string> {
    const genres: Set<string> = new Set();
    moods.forEach(mood => {
        mood.genres.forEach(genre => genres.add(genre));
    });
    return genres;
};

/**
 * Shuffles the stored tracks in localStorage using the Fisher-Yates algorithm.
 * @example
 * // shuffles tracks currently in localStorage
 * shuffleTracks();
 * @precondition Track data exists in localStorage (otherwise returns early).
 * @sideeffect Clears and rewrites the track data in localStorage with the shuffled order.
 * @returns {void}
 */
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


/**
 * Orchestrates the full track generation pipeline: resolves mood names to mood profiles,
 * extracts genres, fetches tracks from Spotify, and shuffles them.
 * @example
 * main(["chill", "happy"], 20, token);
 * @param {Array<string>} inputMoods - Array of mood name strings to look up.
 * @param {number} inputLength - Total number of tracks to fetch.
 * @param {string} token - Spotify OAuth Bearer token.
 * @precondition inputMoods contains valid mood names recognized by getMoodById.
 *              inputLength is a positive integer. token is a valid Spotify OAuth token.
 * @sideeffect Clears existing track data, fetches new tracks, and saves shuffled results to localStorage.
 * @returns {void}
 */
export async function main(inputMoods: Array<string>, inputLength: number, token: string): Promise<void> {
        const moodProfiles = inputMoods
            .map(moodName => getMoodById(moodName))
            .filter((mood): mood is MoodProfile => mood !== undefined);// inefficient but works
        clearTrackData();
        const genres = moodsToGenres(moodProfiles);
        await getTracks(genres, inputLength, token);
        //Todo: filter out excluded genres
        shuffleTracks();
}


export async function funny(token: string): Promise<void> {
    let mood = {
        id: "random1",
        label: "Random 1",
        description: "Random mood profile",
        genres: [] as string[],
    }
    for (let i = 0; i <= 16; i++) {
        mood.genres.push(genresAll[Math.floor(Math.random() * genresAll.length)]);
    }
    const genreSet = new Set(mood.genres);
    clearTrackData();
    await getTracks(genreSet, 50, token);
    console.log('Random genres:', mood.genres);
    //Todo: filter out excluded genres
    shuffleTracks();
    const playlistDescription = '' + mood.genres.join(', ');
    await createPlaylist(token, ('Random Playlist ' + Math.floor(Math.random()*1000)), playlistDescription, true)
        .then((playlistId) => {
            console.log('Playlist created with ID:', playlistId);})
        .catch((err) => {
            console.error('Error creating playlist:', err);
        });
    const playlistId = await getStoredPlaylist();
    const tracks = await getStoredTrack().map((track: Track) => track.uri);
    if (playlistId) {
        addTracksToPlaylist(playlistId, tracks, token);
        console.log('Tracks added to playlist:', tracks);
    } else {
        console.error('No stored playlist ID found');
    }

    
}