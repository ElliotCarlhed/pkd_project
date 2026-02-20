import { useEffect, useState } from 'react';
import {
  redirectToAuthCodeFlow,
  exchangeCodeForTokens,
  clearTokenData,
  getUserProfile,
} from './script/auth';
import { createPlaylist } from './script/spotifyApi';
import { Route, Link } from 'wouter';
import { PlaylistCreator } from './script/tinder-playlist';
  

type AuthState = 'idle' | 'loading' | 'authenticated' | 'error';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    // Steg 1: Finns ?code= i URL:en? → Byt mot tokens (händer bara en gång efter login)
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


    // Steg 3: Ingen code, ingen sparad token → visa login
    setAuthState('idle');
  }, []);

  const handleLogin = () => {
    redirectToAuthCodeFlow();
  };

  const handleLogout = () => {
    clearTokenData();
    setAccessToken(null);
    setProfile(null);
    setAuthState('idle');
    setError(null);
  };

  const handleCreatePlaylist = () => {
    createPlaylist(accessToken!, 'api', 'A playlist created via the Spotify API', true)
      .then((playlist) => {
        console.log('Playlist created:', playlist);
      })
      .catch((err) => {
        console.error('Error creating playlist:', err);
      });
  };

  return (
    <div className="app">
      <div className="noise" />

      <header className="header">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="currentColor" className="spotify-icon">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>PKCE Auth Tester</span>
        </div>
        <div className="status-pill" data-state={authState}>
          <span className="status-dot" />
          {authState === 'idle' && 'Not connected'}
          {authState === 'loading' && 'Connecting...'}
          {authState === 'authenticated' && 'Authenticated'}
          {authState === 'error' && 'Error'}
        </div>
      </header>

      <main className="main">
        {authState === 'idle' && (
          <div className="card login-card">
            <div className="card-eyebrow">Spotify PKCE Flow</div>
            <h1 className="card-title">Test your auth integration</h1>
            <p className="card-desc">
              Clicks the button to kick off the PKCE authorization code flow.
              You'll be redirected to Spotify, then back here with a token.
            </p>
            <div className="flow-steps">
              <div className="step"><span>01</span> Generate PKCE verifier &amp; challenge</div>
              <div className="step"><span>02</span> Redirect to Spotify OAuth</div>
              <div className="step"><span>03</span> Exchange code for access token</div>
              <div className="step"><span>04</span> Fetch user profile to verify</div>
            </div>
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
          <div className="card error-card">
            <div className="error-icon">✕</div>
            <h2>Auth Failed</h2>
            <p className="error-msg">{error}</p>
            <button className="btn btn-secondary" onClick={handleLogout}>Try Again</button>
          </div>
        )}

        {authState === 'authenticated' && profile && (
          <>
          <Route path="/callback">
            <div className="authenticated-view">
              <div className="card profile-card">
                <div className="profile-header">
                  {profile.images?.[0] ? (
                    <img src={profile.images[0].url} alt={profile.display_name} className="avatar" />
                  ) : (
                    <div className="avatar avatar-placeholder">
                      {profile.display_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="card-eyebrow">Authenticated as</div>
                    <h2 className="profile-name">{profile.display_name}</h2>
                    <div className="profile-email">{profile.email}</div>
                  </div>
                </div>
                <div className="profile-meta">
                  <div className="meta-item">
                    <span className="meta-label">Country</span>
                    <span className="meta-value">{profile.country}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Plan</span>
                    <span className="meta-value">{profile.product}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Followers</span>
                    <span className="meta-value">{profile.followers?.total?.toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">User ID</span>
                    <span className="meta-value mono">{profile.id}</span>
                  </div>
                </div>
              </div>

              <div>
                <button className="btn btn-copy" onClick={handleCreatePlaylist}>Create Empty Playlist</button>
              </div>
              <div>
                <Link href="/playlist-creator">
                  <a className="btn btn-secondary">Create Playlist</a>
                </Link>

              </div>

              <div className="card token-card">
                <div className="token-header">
                  <div>
                    <div className="card-eyebrow">Access Token</div>
                    <p className="token-hint">Use this to make Spotify API requests</p>
                  </div>
                  <button className="btn btn-copy" onClick={handleCreatePlaylist}>
                    
                  </button>
                </div>
                <div className="token-display">{accessToken}</div>
              </div>

              <button className="btn btn-logout" onClick={handleLogout}>Disconnect</button>
            </div>
          </Route>

          <Route path="/playlist-creator" component={PlaylistCreator} />
          </>
        )}
      </main>
    </div>
  );
}






