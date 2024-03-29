const N = 20;
const NAME = 'last20';
const SPOTIFY_BASE_API = 'https://api.spotify.com/v1';
const SPOTIFY_USER =  SPOTIFY_BASE_API + '/me';
const SPOTIFY_SAVED_TRACKS =  SPOTIFY_BASE_API + '/me/tracks';
const SPOTIFY_USER_PLAYLISTS =  SPOTIFY_BASE_API + '/me/playlists';

const getOptions = () => {
  return {
    headers: {
      'Authorization': 'Bearer ' + getCookie('access_token'),
    },
    cache: 'force-cache',
  };
}

const getUserID = () => {
  return fetch(SPOTIFY_USER, getOptions())
    .then(response => response.json())
    .then(content => content.id)
    .catch(console.error);
}

const getSavedTracks = (n, url=buildURL(SPOTIFY_SAVED_TRACKS, {'limit': N})) => {
  return fetch(url, getOptions())
    .then(response => response.json())
    .then(content => content.items)
    .catch(console.error);
}

const getPlaylists = () => {
  return fetch(SPOTIFY_USER_PLAYLISTS, getOptions())
    .then(response => response.json())
    .catch(console.error);
}

const getPlaylistTracks = (playlistID) => {
  return fetch(SPOTIFY_BASE_API + `/playlists/${playlistID}`, getOptions())
    .then(response => response.json())
    .then(content => content.tracks.items)
    .catch(console.error);
}

const checkIfNameExists = (playlists, name=NAME) => {
  return playlists.find(playlist => playlist.name === name);
}

const createPlaylist = (userID, name=NAME, description='', isPublic=true) => {
  const options = {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      description: description,
      public: isPublic,
    }),
    headers: {
      'Authorization': 'Bearer ' + getCookie('access_token'),
      'Content-Type': 'application/json'
    }
  };
  return fetch(SPOTIFY_BASE_API + `/users/${userID}/playlists`, options)
    .then(response => response.json())
    .catch(console.error);
}

const addTracksToPlaylist = (playlistID, tracks) => {
  const options = {
    method: 'POST',
    body: JSON.stringify({
      uris: tracks.map(track => track.track.uri),
    }),
    headers: {
      'Authorization': 'Bearer ' + getCookie('access_token'),
      'Content-Type': 'application/json'
    }
  };
  return fetch(SPOTIFY_BASE_API + `/playlists/${playlistID}/tracks`, options)
    .then(response => response.json())
    .catch(console.error);
}

const emptyPlaylist = (playlistID, tracks) => {
  const options = {
    method: 'DELETE',
    body: JSON.stringify({
      uris: tracks.map(track => track.track.uri),
    }),
    headers: {
      'Authorization': 'Bearer ' + getCookie('access_token'),
      'Content-Type': 'application/json'
    }
  };
  return fetch(SPOTIFY_BASE_API + `/playlists/${playlistID}/tracks`, options)
    .then(response => response.json())
    .then(content => content.snapshot_id)
    .catch(console.error);
}

const checkExistence = () => {
  getPlaylists()
    .then(content => checkIfNameExists(content.items))
    .then(playlist => {
      if (playlist) {
        document.querySelector('.message .text-field').innerHTML = 'Playlist already exists!';
        showURL(playlist.external_urls.spotify);

        document.getElementById('refresh-btn').addEventListener('click', () => refresh(playlist.id));
        document.querySelector('#refresh-btn').style.display = 'block';
      } else {
        document.querySelector('#create-btn').style.display = 'block';
        document.getElementById('create-btn').addEventListener('click', buildLastN);
      }
    });
}

const refresh = (playlistID) => {
  getPlaylistTracks(playlistID)
    .then(tracks => emptyPlaylist(playlistID, tracks))
    .then(() => getSavedTracks(N))
    .then(tracks => addTracksToPlaylist(playlistID, tracks))
    .then(() => {
      document.querySelector('.message').innerHTML = 'Playlist is up to date!';
      document.querySelector('#refresh-btn').style.display = 'none';
      document.querySelector('.message').style.display = 'block';
    });
}

const buildLastN = () => {
  getUserID()
    .then(userID => Promise.all([createPlaylist(userID), getSavedTracks(N)])
      .then(values => {
        addTracksToPlaylist(values[0].id, values[1]);
        return values[0];
      })
      .then(data => {
        document.querySelector('.message .text-field').innerHTML = 'Playlist created!';
        showURL(data.external_urls.spotify)
        document.querySelector('#create-btn').style.display = 'none';
        document.querySelector('.message').style.display = 'block';
      }));
}

const showURL = url => {
  document.querySelector('.message .url-field').innerHTML =
    'The URL is:<br/>' + '<a href="' + url + '">' + url + '</a>';
  document.querySelector('.message').style.display = 'block';
}