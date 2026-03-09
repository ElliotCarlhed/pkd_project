import { useEffect, useState } from 'react';
import {
  redirectToAuthCodeFlow,
  exchangeCodeForTokens,
  getUserProfile,
} from './script/auth';
import {getTracks, clearTrackData } from './script/spotifyApi';
import { Route, useLocation } from 'wouter';
import { PlaylistCreator } from './script/tinder-playlist';
import { getMoodById, moods } from './script/moodProfiles';
  


type AuthState = 'idle' | 'loading' | 'authenticated' | 'error';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_ , setLocation] = useLocation();
  const [currentmoods, setCurrentMoods] = useState<Array<string>>([]);
  

  const toggleMood = (id: string) => {
    setCurrentMoods(prev =>
      prev.includes(id)
        ? prev.filter(moodId => moodId !== id)
        : [...prev, id]
    );
  }

  const handleCreateandNavigate = async () => {
    clearTrackData();
    try {
      await handleGetTrack();
      setLocation('/playlist-creator');
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  }

  console.log('Token:', accessToken);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(`Spotify denied access: ${errorParam}`);
      setAuthState('error');
      window.history.replaceState({}, document.title, '/callback');
      return;
    }
    
    // Steg 1: Finns ?code= i URL:en? -> Byt mot tokens (händer bara en gång efter login)
    if (code) {
      setAuthState('loading');
      window.history.replaceState({}, document.title, '/callback'); // Rensa URL DIREKT så code inte återanvänds
      exchangeCodeForTokens(code)
        .then(async (tokenData) => {
          setAccessToken(tokenData.accessToken);
          const user = await getUserProfile(tokenData.accessToken);
          setProfile(user);
          setAuthState('authenticated');
        })
        .catch((err) => {
          setError(err.message || 'Token exchange failed');
          setAuthState('error');
        });
      return;
    }

    // Steg 3: Ingen code, ingen sparad token -> visa login
    setAuthState('idle');
  }, []);

  const handleLogin = () => {
    redirectToAuthCodeFlow();
  };

  const handleGetTrack = async () => {

    const test = currentmoods
      .map(genre => getMoodById(genre))
      .filter(mood => mood !== undefined) as Array<MoodProfile>;

    console.log('Selected moods:', test);

    await getTracks(test, 20, accessToken!);
  };

  return (
    <div className="app">
      <div className="noise" />

      <main className="main">
        {authState === 'idle' && (
          <div className="card login-card">
            <h1 className="card-title">Spotifynder</h1>
            <p className="card-desc">
              Redirect to spotify for authentication 
            </p>
            <button className="btn btn-primary" onClick={handleLogin}>
              Connect with Spotify
            </button>
          </div>
        )}

        {authState === 'loading' && (
          <div className="card loading-card">
            <div className="spinner" />
            <p>Exchanging authorization code for token...</p>
          </div>
        )}

        {authState === 'error' && (
          <div><h1>Auth Failed</h1></div>
        )}

        {authState === 'authenticated' && profile && (
          <>
          <Route path="/callback">
            <div className="authenticated-view">
                <div className="profile-header">
                  <div>
                    <h2 className="profile-name">{profile.display_name}</h2>
                  </div>
                </div>
              <div className="mood-selector">
                <style>{`
                  .mood-selector {
                    padding: 1rem;
                  }
                  .mood-selector-heading {
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                  }
                  .mood-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                  }
                  .mood-chip {
                    padding: 0.25rem 0.5rem;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    background: #f0f0f0;
                    cursor: pointer;
                  }
                  .mood-chip.active {
                    background: #1db954;
                    color: #000;
                  }
                `}</style>
                <p className="mood-selector-heading">Select moods</p>
                <div className="mood-chips">
                  {moods.map(mood => {
                    const isActive = currentmoods.includes(mood.id);
                    return (
                      <button
                        key={mood.id}
                        className={`mood-chip${isActive ? ' active' : ''}`}
                        onClick={() => toggleMood(mood.id)}
                        type="button"
                      >
                        <span className="mood-chip-check">
                          {isActive ? '✓' : ''}
                        </span>
                        {mood.id}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <button className="btn btn-copy" onClick={handleCreateandNavigate}>Create Playlist</button>
              </div>
              <div>
              </div>
            </div>
          </Route>
          <Route path="/playlist-creator">
            <PlaylistCreator
              accessToken={accessToken!} 
            />
          </Route>
          </>
        )}
      </main>
    </div>
  );
}






