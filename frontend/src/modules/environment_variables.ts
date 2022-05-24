const port = 8000;
const protocol = 'http';
const hostName = 'localhost';
const baseUrl = `https://ps1lpt2szj.execute-api.us-east-1.amazonaws.com`;
const galleryServerUrl = `${baseUrl}/gallery`;
const logInServerUrl = `${baseUrl}/auth/login`;
const uploadPictureServerUrl = `${baseUrl}/gallery/upload-picture`;
const signUpServerUrl = `${baseUrl}/auth/signup`;
const unsplashServerUrl = `${baseUrl}/unsplash/pictures`;
const galleryUrl = `./gallery.html`;
const loginUrl = `./index.html`;
const currentUrl = new URL(window.location.href);

export {
  port,
  protocol,
  hostName,
  logInServerUrl,
  uploadPictureServerUrl,
  galleryServerUrl,
  signUpServerUrl,
  galleryUrl,
  loginUrl,
  currentUrl,
  unsplashServerUrl
}