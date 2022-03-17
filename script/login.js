const ACCESS_URL = 'https://accounts.spotify.com/api/token';
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const CURRENT_URL = location.protocol + '//' + location.host + location.pathname;
const CLIENT_ID = '';
const CLIENT = '';
const PERMISSIONS = 'user-library-read';


const getURLParams = () => {
  let hashParams = {};
  let e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.search.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

const generateRandomString = (length) => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const buildURL = (base, arr) => {
  return base + '?' + (new URLSearchParams(arr)).toString();
}

const toBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
}

const login = () => {
  const accessToken = getCookie('access_token');
  const state = getCookie('state');

  const params = getURLParams();
  const authCode = 'code' in params ? params.code : getCookie('code');
  const error = 'error' in params ? params.error : null;

  if (error) {
    alert('There was an error during the authentication');
  }

  if (accessToken) {
    console.log('Access Token present!');
    loggedIn();
  } else if (authCode) {
    console.log('Auth Code present!');
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: CURRENT_URL
    });

    const options = {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Authorization': 'Basic ' + toBase64(CLIENT_ID + ':' + CLIENT),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    fetch(ACCESS_URL, options)
      .then(response => response.json())
      .then(content => {
        if (content.access_token) {
          setCookie('access_token', content.access_token, 1);
          loggedIn();
        }
      })
      .catch(error => console.error(error))
  } else {
    console.log('Getting auth code...');
    const state = generateRandomString(16);

    setCookie('state', state, 1);

    document.getElementById('login-btn').addEventListener('click', () => {
      window.location.href = buildURL(AUTH_URL,
        {
          'response_type': 'code',
          'client_id': CLIENT_ID,
          'scope': PERMISSIONS,
          'redirect_uri': CURRENT_URL,
          'state': state
        });
    });
  }
}
