import { Link } from 'wouter';
import TinderCard from 'react-tinder-card';

const songs: Array<Track> = [
  {
    id: '1',
    name: 'Song One',
    artists: [{ id: 'a1', name: 'Artist One' }],
    album: { 
            id: 'al1', 
            name: 'Album One', 
            imageUrl: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228', 
            releaseDate: '2020-01-01' 
          },
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1',
    durationMs: 210000,
    imageUrl: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
  }
]

const onSwipe = (direction: string, track: Track) => {
  console.log(`Swiped ${direction} on ${track.name}`);
}

const onCardLeftScreen = (trackName: string) => {
  console.log(`${trackName} left the screen`);
}

export function PlaylistCreator() {
  return (
    <div className="playlist-creator">
      <h1>Playlist Creator</h1>
      
      {songs.map((track) => (
        <TinderCard 
          key={track.id}
          onSwipe={(direction) => onSwipe(direction, track)}
          onCardLeftScreen={() => onCardLeftScreen(track.name)}
        >
          <div className="card bg-light text-dark">
            <img 
              src={track.imageUrl} 
              alt={track.name} 
              style={{width: "300px"}}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
            <h2>{track.name}</h2>
            <p>{track.artists[0].name}</p>
          </div>
        </TinderCard>
      ))}
      <Link href="/callback">
        <a className="btn btn-secondary">Back to Home</a>
      </Link>
    </div>
  );
}