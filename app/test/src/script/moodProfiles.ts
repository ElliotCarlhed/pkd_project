// moodProfiles.ts
// Central mood configuration for the Spotify Playlist Builder.
// Each MoodProfile maps a user-facing tag to genres and search terms,
// and optionally excludes genres that would clash with the mood.



export const moods: MoodProfile[] = [
  {
    id: "happy",
    label: "Glad",
    description: "Positiva och solglasögon-vibes",
    genres: ["pop", "dance pop", "feel-good pop"],
    excludeGenres: ["sad", "blues", "emo", "gothic"],
    searchTerms: ["happy", "feel good", "sunshine", "upbeat"],
  },
  {
    id: "sad",
    label: "Sorglig",
    description: "Melankolisk och känslosam musik",
    genres: ["sad", "acoustic", "singer-songwriter", "indie folk"],
    excludeGenres: ["edm", "dance pop", "party"],
    searchTerms: ["sad", "heartbreak", "melancholy", "crying"],
  },
  {
    id: "energetic",
    label: "Energirik",
    description: "Hög energi för träning eller hype",
    genres: ["edm", "drum-and-bass", "electronic", "workout"],
    excludeGenres: ["sad", "acoustic", "ambient", "sleep"],
    searchTerms: ["energy", "hype", "pump up", "power"],
  },
  {
    id: "chill",
    label: "Avslappnad",
    description: "Lugn musik för att varva ner",
    genres: ["chill", "lo-fi beats", "chillhop", "ambient pop"],
    excludeGenres: ["metal", "drum-and-bass", "hardcore"],
    searchTerms: ["chill", "relax", "calm", "mellow"],
  },
  {
    id: "focus",
    label: "Fokus",
    description: "Instrumental musik för koncentration",
    genres: ["lo-fi beats", "study music", "classical", "ambient"],
    excludeGenres: ["party", "dance pop", "hip hop"],
    searchTerms: ["focus", "study", "concentration", "instrumental"],
  },
  {
    id: "party",
    label: "Party",
    description: "Bangers för fest och dans",
    genres: ["dance pop", "edm", "house", "club"],
    excludeGenres: ["sad", "acoustic", "classical", "ambient"],
    searchTerms: ["party", "dance", "club banger", "night out"],
  },
  {
    id: "romantic",
    label: "Romantisk",
    description: "Musik för kärleksfulla stunder",
    genres: ["r&b", "soul", "romantic", "love songs"],
    excludeGenres: ["metal", "punk", "aggressive"],
    searchTerms: ["love", "romantic", "baby", "together"],
  },
  {
    id: "angry",
    label: "Arg",
    description: "Tung och aggressiv musik för att släppa ut frustration",
    genres: ["metal", "hard rock", "punk", "hardcore"],
    excludeGenres: ["pop", "acoustic", "ambient", "classical"],
    searchTerms: ["angry", "rage", "aggressive", "fury"],
  },
  {
    id: "melancholic",
    label: "Melankolisk",
    description: "Vackert vemod och eftertanke",
    genres: ["indie folk", "post-rock", "dream pop", "shoegaze"],
    excludeGenres: ["edm", "party", "dance"],
    searchTerms: ["melancholy", "nostalgic", "bittersweet", "longing"],
  },
  {
    id: "nostalgic",
    label: "Nostalgisk",
    description: "Musik som tar dig tillbaka i tiden",
    genres: ["80s", "90s", "classic rock", "synthpop"],
    searchTerms: ["retro", "throwback", "classic", "old school"],
  },
  {
    id: "confident",
    label: "Självsäker",
    description: "Musik som får dig att känna dig oslagbar",
    genres: ["hip hop", "rap", "trap", "urban"],
    excludeGenres: ["sad", "acoustic"],
    searchTerms: ["confident", "boss", "swagger", "flex"],
  },
  {
    id: "dreamy",
    label: "Drömmig",
    description: "Svävande och eterisk musik",
    genres: ["dream pop", "shoegaze", "ambient pop", "indie pop"],
    excludeGenres: ["metal", "punk", "hardcore"],
    searchTerms: ["dreamy", "ethereal", "floating", "hazy"],
  },
  {
    id: "workout",
    label: "Träning",
    description: "Maximalt driv för gymmet",
    genres: ["workout", "edm", "hip hop", "drum-and-bass"],
    excludeGenres: ["acoustic", "ambient", "classical", "sleep"],
    searchTerms: ["workout", "gym", "motivation", "beast mode"],
  },
  {
    id: "morning",
    label: "Morgon",
    description: "Frisk och positiv start på dagen",
    genres: ["acoustic pop", "indie pop", "folk pop"],
    excludeGenres: ["metal", "sad", "dark"],
    searchTerms: ["morning", "sunrise", "fresh start", "good morning"],
  },
  {
    id: "latenight",
    label: "Sen kväll",
    description: "Musik för sena nattliga timmar",
    genres: ["dark pop", "synthwave", "r&b", "soul"],
    excludeGenres: ["workout", "edm", "punk"],
    searchTerms: ["late night", "midnight", "dark", "after hours"],
  },
  {
    id: "roadtrip",
    label: "Roadtrip",
    description: "Perfekt sällskap på långa bilresor",
    genres: ["classic rock", "indie rock", "alternative", "country"],
    searchTerms: ["road trip", "highway", "driving", "open road"],
  },
  {
    id: "summer",
    label: "Sommar",
    description: "Värme, sol och sommarsemester-känsla",
    genres: ["tropical house", "reggae", "surf", "pop"],
    excludeGenres: ["dark", "metal", "sad"],
    searchTerms: ["summer", "beach", "sunshine", "vacation"],
  },
  {
    id: "rainy",
    label: "Regnig dag",
    description: "Mysig musik för regniga dagar inomhus",
    genres: ["acoustic", "indie folk", "jazz", "lo-fi beats"],
    excludeGenres: ["edm", "party", "dance pop"],
    searchTerms: ["rainy day", "cozy", "indoor", "coffee"],
  },
  {
    id: "hiphop",
    label: "Hip Hop",
    description: "Beats, bars och flow",
    genres: ["hip hop", "rap", "trap", "boom bap"],
    searchTerms: ["rap", "bars", "flow", "freestyle"],
  },
  {
    id: "acoustic",
    label: "Akustisk",
    description: "Avskalad och ärlig musik med akustiska instrument",
    genres: ["acoustic", "folk", "singer-songwriter", "acoustic pop"],
    excludeGenres: ["edm", "electronic", "metal"],
    searchTerms: ["acoustic", "unplugged", "raw", "folk"],
  },
];

// Helper: look up a mood by its id
export function getMoodById(id: string): MoodProfile | undefined {
  return moods.find((m) => m.id === id);
}

// Helper: combine genres and search terms from multiple selected moods
export function buildSearchConfig(selectedMoods: MoodProfile[]): {
  genres: string[];
  searchTerms: string[];
  excludeGenres: string[];
} {
  const genres = [...new Set(selectedMoods.flatMap((m) => m.genres))];
  const searchTerms = [...new Set(selectedMoods.flatMap((m) => m.searchTerms))];
  const excludeGenres = [...new Set(selectedMoods.flatMap((m) => m.excludeGenres ?? []))];

  // Remove any excluded genre that another selected mood explicitly includes
  const filteredExclusions = excludeGenres.filter((ex) => !genres.includes(ex));

  return { genres, searchTerms, excludeGenres: filteredExclusions };
}
