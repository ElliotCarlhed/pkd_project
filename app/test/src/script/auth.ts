import { generateRandomString, generateCodeChallenge } from './pkceUtils';



const clientId = '73a3a809ccb5460eb8c60282963dd48e';
const redirectUri = 'http://127.0.0.1:8888/callback';
const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private streaming user-read-playback-state user-modify-playback-state user-read-currently-playing';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  EXPIRES_AT: 'spotify_expires_at',
  CODE_VERIFIER: 'spotify_code_verifier',
} as const;

// saves the access token and its expiration time in localStorage
const saveTokenData = (data: TokenData): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, data.expiresAt.toString());
};

// retrieves the access token and its expiration time from localStorage
const getStoredTokenData = (): TokenData | null => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);


  if (!accessToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    expiresAt: parseInt(expiresAt, 10),
  };
};
//hej
// clears the stored data in the categries defined in STORAGE_KEYS from localStorage
export const clearTokenData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
};

// Generates a PKCE challenge and redirects the user to Spotify's login page
export const redirectToAuthCodeFlow = async (): Promise<void> => {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  window.location.href = authUrl;
};

// Exchanges the authorization code returned by Spotify for an access token and saves it
export const exchangeCodeForTokens = async (code: string): Promise<TokenData> => {
  const verifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);

  if (!verifier) {
    throw new Error('Code verifier saknas! Användaren måste logga in igen.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Token-byte misslyckades: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const tokenData: TokenData = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  saveTokenData(tokenData);

  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

  return tokenData;
};







// Checks if the user is logged in 
// (for future use so users stay logged in after refreshing the page)
export const isLoggedIn = (): boolean => {
  return getStoredTokenData() !== null;
};

// Logs the user out by clearing the stored token data and redirecting to the homepage
export const logout = (): void => {
  clearTokenData();
  window.location.href = '/';
};

// Fetches the user's profile information using the access token
export const getUserProfile = async (token: string) => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return result.json();
};