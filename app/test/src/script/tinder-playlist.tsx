import { Link } from 'wouter';
import TinderCard from 'react-tinder-card';
import { useState, useEffect as Effect, useRef } from 'react';
import type { SVGProps} from 'react';
import {saveTrackData, clearTrackData, getStoredTrack, createPlaylist, createPlaylistAddTracks} from './spotifyApi'
import { demoPlay, togglePlay } from './playerfunction';
import { transferPlayback } from './PlayerApi';

// SVG's from svgrepo.com
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

interface PlaylistCreatorProps {
  accessToken: string | null; // token from parent
  // add any additional state props here
}


export function PlaylistCreator({ accessToken }: PlaylistCreatorProps) {
  const [Tracks, setTracks] = useState<Array<Track>>(getStoredTrack() || []);
  const [LikedTracks, setLikedTracks] = useState<Array<Track>>([]);
  const [DislikedTracks, setDislikedTracks] = useState<Array<Track>>([]);
  const [deckFinished, setDeckFinished] = useState<boolean>(false);
  const [savingPlaylist, setSavingPlaylist] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(true);


  Effect(() => {
          if (playerRef.current) return; 


              const player = new window.Spotify.Player({
                  name: "My Vite Spotify Player",
                  getOAuthToken: (cb: (t: string) => void) => cb( accessToken! ),
                  volume: 0.5,
              }); 

              playerRef.current = player;
              
              
              player.addListener("ready", async ({ device_id }: {device_id: string}) => {
                  setDeviceId(device_id);
                  try {
                      await transferPlayback(accessToken, device_id);
                  } catch (e) {
                      console.log(e instanceof Error ? e.message : "Transfer playback function failed"); 
                  }
              });
              // Keeps pause button in sync
              player.addListener("player_state_changed", (state: any) => {
                  if (!state) return; 
                      setIsPaused(state.paused);
              });

              player.connect()  
          

      }, [accessToken]);

  
  Effect(() => {
      if (Tracks.length === 0 || !deviceId || !accessToken) return;
      demoPlay(accessToken, Tracks[0].uri, deviceId);
  }, [Tracks, deviceId, accessToken]);



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

  const handleGeneratePlaylist = (token: string, name: string, description: string, isPublic: boolean) => {
    clearTrackData();
    saveTrackData(LikedTracks);
    createPlaylistAddTracks(
      token,
      name,
      description,
      isPublic
    )
  }

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

        {!savingPlaylist && (
          <>
            <h1>Deck Finished</h1>
            <p>Liked tracks: {LikedTracks.length}</p>
            <p>Disliked tracks: {DislikedTracks.length}</p>
            <button
                className="btn btn-secondary" 
                onClick={() => togglePlay(playerRef)} 
                disabled={!deviceId}>
                {isPaused ? "Paused" : "Press to pause music"}
            </button>
          </>
        )}

        {savingPlaylist && (
          <>
            <h1>Playlist name:</h1>  
            <input 
              type="text" 
              placeholder='Enter name of playlist' 
              style={{
                padding: '10px',
                fontSize: '16px',
                width: '300px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                alignItems: 'center',
                textAlign: 'center'
              }} />
          </>
        )}

        <button 
          className='btn btn-secondary' 
          style={{backgroundColor: '#2a8036'}} 
          onClick={() => {
            if (!savingPlaylist) {
              setSavingPlaylist(true);
            } else {
              handleGeneratePlaylist(
                accessToken!, 
                (document.querySelector('input') as HTMLInputElement)?.value || 'My Tinder Playlist', 
                'A playlist generated from the Tinder-like interface', 
                true);
              // TODO: Redirect to home page 
            }
          }}>
          {savingPlaylist ? 'Create Playlist' : 'Save Playlist'}
        </button>

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
              <p>{Tracks[0].artists.map((artist) => artist.name).join(', ')}</p>
              <button 
                className="btn btn-secondary" 
                style={{backgroundColor: '#1DB964', color: 'black', margin: '10px'}}
                onClick={() => demoPlay(accessToken, Tracks[0].uri, deviceId)} 
                disabled={!deviceId}> 
                Play song 
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => togglePlay(playerRef)} 
                disabled={!deviceId}>
                {isPaused ? "Play" : "Pause"}
              </button>

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