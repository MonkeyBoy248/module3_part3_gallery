import { Token } from "../modules/token.service.js";
import { redirectToTheGalleryPage } from "../modules/redirection.service.js";
import { currentUrl, loginUrl } from "../modules/env.js";

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



