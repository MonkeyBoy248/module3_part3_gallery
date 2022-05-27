import * as env from "./env.js";

export function setCurrentPageUrl (targetUrl: string): string {
  const limit = env.currentUrl.searchParams.get('limit') || '4';
  const pageNumber = env.currentUrl.searchParams.get('page') || '1';
  const filter = env.currentUrl.searchParams.get('filter') || 'false';
  const keyWord = env.currentUrl.searchParams.get('keyWord');

  return `${targetUrl}?page=${pageNumber}&limit=${limit}&filter=${filter}&keyWord=${keyWord}`;
}

export function redirectToTheGalleryPage () {
  const galleryUrl = setCurrentPageUrl(env.galleryUrl);

  window.location.replace(galleryUrl);
}