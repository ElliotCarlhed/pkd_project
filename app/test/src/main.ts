// main.ts
import { redirectToAuthCodeFlow, getAccessToken } from '../auth/auth';

async function main() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    // No code? Redirect to login
    redirectToAuthCodeFlow();
  } else {
    // Code exists? Exchange for token
    const accessToken = await getAccessToken(code);
    console.log("Access Token:", accessToken);
    
    // Clean up URL
    window.history.replaceState({}, document.title, "/");
    
    // Now you can use the accessToken to call Spotify APIs
  }
}

main();