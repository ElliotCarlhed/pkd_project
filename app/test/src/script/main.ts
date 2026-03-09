
import {
  redirectToAuthCodeFlow
} from './auth';


async function main() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');


  
  redirectToAuthCodeFlow();
}




main();
