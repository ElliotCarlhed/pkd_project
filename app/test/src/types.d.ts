
interface Window {
  onSpotifyWebPlaybackSDKReady?: () => void;
  Spotify?: any; 
}



interface MoodProfile {
  id: string;
  label: string;
  description: string;
  genres: string[];
  excludeGenres?: string[];
  searchTerms: string[];
  seedArtists?: string[];
}


interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  previewUrl: string | null;
  externalUrl: string; 
  durationMs: number;
  imageUrl: string;
  uri: string;
}

interface Artist {
  id: string;
  name: string;
}

interface Album {
  name: string;
  imageUrl: string;
}


interface SwipeSession {
  id: string;
  selectedMoods: MoodProfile[];
  tracks: Track[];
  currentIndex: number;
  accepted: Track[];
  rejected: Track[];
  createdAt: Date;
}


interface PlaylistResult {
  name: string;
  description: string;
  tracks: Track[];
  spotifyPlaylistId?: string;
  spotifyUrl?: string;
}

interface UserProfile {
  display_name: string;
  email: string;
  images: { url: string }[];
  followers: { total: number };
  country: string;
  product: string;
  id: string;
}
interface TokenData {
  accessToken: string;
  expiresAt: number;
}

interface SpotifyRawTrack {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
    uri: string;
}