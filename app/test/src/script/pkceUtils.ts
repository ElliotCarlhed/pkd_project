// pkceUtils.ts
// Dessa funktioner behövs bara en gång: vid den allra första inloggningen.
// De skapar det "engångslösenord" (PKCE) som bevisar vår identitet för Spotify.

/**
 * Genererar en kryptografiskt säker slumpmässig sträng.
 * Används som "code verifier" — vår hemliga nyckel i PKCE-flödet.
 */
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

/**
 * Skapar en "code challenge" genom att SHA-256-hasha code verifier.
 * Challenge skickas till Spotify öppet, verifier sparas lokalt.
 * Senare bevisar vi vår identitet genom att skicka verifier (SHA-256(verifier) === challenge).
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64urlencode(new Uint8Array(digest));
};

/**
 * Kodar binär data till base64url-format (URL-säkert).
 * Vanlig base64 innehåller +, / och = som har speciell betydelse i URL:er,
 * så vi byter ut dem.
 */
const base64urlencode = (a: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
