// main.ts
// Appens startpunkt. Hanterar auth-flödet och startar appen.

import {
  redirectToAuthCodeFlow
} from './auth';

/**
 * Huvudflöde:
 * 
 * Scenario 1: Användaren besöker sidan för första gången
 *   → Ingen token finns → skicka till Spotifys inloggning
 * 
 * Scenario 2: Användaren kommer tillbaka från Spotify med ?code=xxx
 *   → Byt code mot tokens → starta appen
 * 
 * Scenario 3: Användaren laddar om sidan (redan inloggad)
 *   → Token finns i localStorage → starta appen direkt
 *   → Om token har gått ut förnyas den automatiskt av getValidAccessToken()
 */
async function main() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');


  // Scenario 1: Inte inloggad → skicka till Spotify
  redirectToAuthCodeFlow();
}




main();
