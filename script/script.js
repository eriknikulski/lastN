const setCookie = (cName, cValue, expHours) => {
  let date = new Date();
  date.setTime(date.getTime() + (expHours * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

const getCookie = (cName) => {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie);
  const cArr = cDecoded.split('; ');
  let res = null;
  cArr.forEach(val => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  })
  return res;
}

const loggedIn = () => {
  document.querySelector('.pre-login').style.display = 'none';
  document.querySelector('.post-login').style.display = 'block';
}

document.addEventListener("DOMContentLoaded", () => {
  login();
});
