interface MoodProfile {
  id: string;
  label: string;
  description: string;
  genres: string[];
  excludeGenres?: string[];
  searchTerms: string[];
  seedArtists?: string[];
}

// Förenklad representation av en Spotify-låt
interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  previewUrl: string | null;
  externalUrl: string;       // Länk till Spotify
  durationMs: number;
  imageUrl: string;
}

interface Artist {
  id: string;
  name: string;
}

interface Album {
  id: string;
  name: string;
  imageUrl: string;
  releaseDate: string;
}

// Swipe-session: håller koll på pågående session
interface SwipeSession {
  id: string;
  selectedMoods: MoodProfile[];
  tracks: Track[];              // Alla hämtade låtar
  currentIndex: number;         // Vilken låt som visas nu
  accepted: Track[];            // Låtar som svepats höger
  rejected: Track[];            // Låtar som svepats vänster
  createdAt: Date;
}

// Resultat som ska bli en spellista
interface PlaylistResult {
  name: string;
  description: string;
  tracks: Track[];
  spotifyPlaylistId?: string;   // Sätts efter att spellistan skapats
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