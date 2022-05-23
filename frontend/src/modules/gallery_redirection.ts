import {currentUrl, galleryUrl} from "./environment_variables.js";

export function redirectToTheGalleryPage () {
  const currentPage = currentUrl.searchParams.get('currentPage');
  const currentLimit = currentUrl.searchParams.get('limit');
  const currentFilter = currentUrl.searchParams.get('filter');

  if (!currentPage) {
    window.location.replace(`${galleryUrl}?page=1&limit=4&filter=false`);
  } else {
    window.location.replace(`${galleryUrl}?page=${currentPage}&limit=${currentLimit}&filter=${currentFilter}`);
  }
}