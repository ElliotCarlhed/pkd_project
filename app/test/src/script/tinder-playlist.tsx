import { Link } from 'wouter';
import TinderCard from 'react-tinder-card';
import { useState } from 'react';
import type { SVGProps } from 'react';


// SVG's 
const RightArrowSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg width="110px" height="110px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 12H6.5M20 12L14 6M20 12L14 18M20 12H9.5" stroke="#2a8036" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
) 

const LeftArrowSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg width="110px" height="110px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 12L10 6M4 12L10 18M4 12H14.5M20 12H17.5" stroke="#74343d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
)

const songs: Array<Track> = [
  {
    id: '1',
    name: 'Song One',
    artists: [{ id: 'a1', name: 'Artist One' }],
    album: {
      id: 'al1',
      name: 'Album One',
      imageUrl:
        'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
      releaseDate: '2020-01-01',
    },
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1',
    durationMs: 210000,
    imageUrl:
      'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
  },
  {
    id: '2',
    name: 'Song Two',
    artists: [{ id: 'a2', name: 'Artist Two' }],
    album: {
      id: 'al1',
      name: 'Album One',
      imageUrl:
        'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
      releaseDate: '2020-01-01',
    },
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1',
    durationMs: 210000,
    imageUrl:
      'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
  },
  {
    id: '3',
    name: 'Song Three',
    artists: [{ id: 'a3', name: 'Artist Three' }],
    album: {
      id: 'al1',
      name: 'Album One',
      imageUrl:
        'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
      releaseDate: '2020-01-01',
    },
    previewUrl: null,
    externalUrl: 'https://open.spotify.com/track/1',
    durationMs: 210000,
    imageUrl:
      'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
  },
];

export function PlaylistCreator() {
  const [Tracks, setTracks] = useState<Array<Track>>(songs);
  const [LikedTracks, setLikedTracks] = useState<Array<Track>>([]);
  const [DislikedTracks, setDislikedTracks] = useState<Array<Track>>([]);
  const [deckFinished, setDeckFinished] = useState<boolean>(false);

  const onSwipe = (
    direction: string,
    track: Track,
    fromButton: boolean = false
  ) => {
    console.log(`Swiped ${direction} on ${track.name}`);

    if (direction === 'right') {
      setLikedTracks((prev) => [...prev, track]);
    } else if (direction === 'left') {
      setDislikedTracks((prev) => [...prev, track]);
    }

    // Remove the track and check if deck is empty
    setTracks((prev) => {
      const updated = prev.filter((t) => t.id !== track.id);

      if (updated.length === 0) {
        setDeckFinished(true);
      }

      return updated;
    });
  };

  const onCardLeftScreen = (trackName: string) => {
    console.log(`${trackName} left the screen`);
  };


  if (deckFinished) {
    return (
      <div
        className="final-playlist"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <h1>Deck Finished</h1>
        <p>Liked tracks: {LikedTracks.length}</p>
        <p>Disliked tracks: {DislikedTracks.length}</p>

        <Link href="/callback">
          <a className="btn btn-secondary">Back to Home</a>
        </Link>
      </div>
    );
  }

  return (

    <div 
      className='flex-box'
      style={
        {
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }
    >

    <LeftArrowSVG/>

      <div
        className="playlist-creator"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          justifyContent: 'center'
        }}
      >
        <h1>Playlist Creator</h1>

        {Tracks.length > 0 && (
          <TinderCard
            key={Tracks[0].id}
            onSwipe={(direction) => onSwipe(direction, Tracks[0])}
            onCardLeftScreen={() =>
              onCardLeftScreen(Tracks[0].name)
            }
          >
            <div className="card bg-light text-dark">
              <img
                src={Tracks[0].imageUrl}
                alt={Tracks[0].name}
                style={{ width: '300px' }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              <h2>{Tracks[0].name}</h2>
              <p>{Tracks[0].artists[0].name}</p>
            </div>

            <div 
              className='btn-options'
              style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >

              <button
                className="btn btn-danger"
                onClick={() => onSwipe('left', Tracks[0], true)}
                style={{width: '100%', gap: '5px', backgroundColor: '#cc342f'}}
              >
                Dislike
              </button>

              <button
                className="btn btn-primary"
                onClick={() => onSwipe('right', Tracks[0], true)}
              >
                Like
              </button>

            </div>
            
          </TinderCard>
        )}

        <Link href="/callback">
          <a className="btn btn-secondary">Back to Home</a>
        </Link>
      </div>

      <RightArrowSVG/>

    </div>
  );
}