import { Token } from "../modules/token_management.js";
import { redirectToTheGalleryPage } from "../modules/gallery_redirection.js";
import { currentUrl, loginUrl } from "../modules/environment_variables.js";

const homeLink = document.querySelector('.content__home-link');

homeLink?.addEventListener('click', homeRedirection);

function homeRedirection (e: Event) {
  e.preventDefault();
  homeLink?.removeEventListener('click', homeRedirection);

  if (Token.getToken()) {
    redirectToTheGalleryPage();
  } else {
    window.location.replace(`${loginUrl}?currentPage=${currentUrl.searchParams.get('page')}`);
  }
}



