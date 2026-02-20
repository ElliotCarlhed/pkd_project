// auth.ts
// Hanterar all kommunikation med Spotifys autentisering.
// Stödjer: inloggning (PKCE), token-lagring, och automatisk token-förnyelse.

import { generateRandomString, generateCodeChallenge } from './pkceUtils';

// ============================================================
// KONFIGURATION
// ============================================================

const clientId = '73a3a809ccb5460eb8c60282963dd48e';
const redirectUri = 'http://127.0.0.1:8888/callback';

// Uppdaterade scopes för ert projekt:
// - user-read-private & user-read-email: Läsa användarprofil
// - user-top-read: Hämta användarens topplåtar/artister
// - playlist-modify-public & playlist-modify-private: Skapa/ändra spellistor
const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';

// ============================================================
// TOKEN-TYPER
// ============================================================

/**
 * Representerar all token-data vi får från Spotify.
 * Detta är en "komplex datatyp" — ett objekt med flera fält av olika typer.
 */
export interface TokenData {
  accessToken: string;       // Nyckeln som ger oss tillgång till API:t
  expiresAt: number;         // Tidsstämpel (ms) för när accessToken slutar gälla
}

// ============================================================
// TOKEN-LAGRING (localStorage)
// ============================================================

// Nycklarna vi använder i localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  EXPIRES_AT: 'spotify_expires_at',
  CODE_VERIFIER: 'spotify_code_verifier',
} as const;

/**
 * Sparar token-data i localStorage så den överlever sidladdningar.
 */
const saveTokenData = (data: TokenData): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, data.expiresAt.toString());
};

/**
 * Hämtar sparad token-data från localStorage.
 * Returnerar null om det inte finns någon sparad data.
 */
const getStoredTokenData = (): TokenData | null => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

  // Om något saknas finns det ingen giltig token
  if (!accessToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    expiresAt: parseInt(expiresAt, 10),
  };
};

/**
 * Rensar all token-data. Användbar vid utloggning.
 */
export const clearTokenData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
};

// ============================================================
// PKCE-INLOGGNING (steg 1-3)
// ============================================================

/**
 * Skickar användaren till Spotifys inloggningssida.
 * 
 * Flöde:
 * 1. Generera code verifier (hemligt engångslösenord)
 * 2. Skapa code challenge (krypterad version av verifier)
 * 3. Spara verifier lokalt
 * 4. Navigera till Spotify med challenge
 * 
 * Efter inloggning skickar Spotify tillbaka användaren till redirectUri
 * med en ?code=xxx parameter i URL:en.
 */
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

// ============================================================
// TOKEN-BYTE (steg 6-7)
// ============================================================

/**
 * Byter authorization code mot access token + refresh token.
 * 
 * Detta händer en gång: direkt efter att användaren loggat in och
 * Spotify skickat tillbaka dem med en ?code=xxx.
 * 
 * Vi skickar code + verifier till Spotify. Spotify verifierar att
 * SHA-256(verifier) === challenge vi skickade tidigare.
 * Om det stämmer → vi får tokens!
 */
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

  // Spotify svarar med: { access_token, refresh_token, expires_in, token_type, scope }
  const data = await response.json();

  const tokenData: TokenData = {
    accessToken: data.access_token,
    // Beräkna exakt tidpunkt när token går ut.
    // expires_in är i sekunder (3600 = 1 timme), vi konverterar till millisekunder.
    // Vi drar av 60 sekunder som marginal så vi förnyar innan den faktiskt går ut.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  saveTokenData(tokenData);

  // Vi behöver inte code verifier längre
  localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

  return tokenData;
};








// ============================================================
// HJÄLPFUNKTIONER
// ============================================================

/**
 * Kollar om användaren verkar vara inloggad (har sparad token-data).
 * OBS: Token kan fortfarande vara utgången — getValidAccessToken() hanterar det.
 */
export const isLoggedIn = (): boolean => {
  return getStoredTokenData() !== null;
};

/**
 * Loggar ut användaren genom att rensa all sparad data.
 */
export const logout = (): void => {
  clearTokenData();
  window.location.href = '/';
};

export const getUserProfile = async (token: string) => {
  const result = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return result.json();
};