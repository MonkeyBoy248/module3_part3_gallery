export interface TokenObject {
  token: string;
  timestamp?: number;
}

export interface User {
  email: string;
  password: string;
}

export interface GalleryData {
  objects: string[],
  page: number;
  total: number;
}

export interface UnsplashPictureUrl {
  id: string;
  urls: {full: string, raw: string, regular: string, small: string, thumb: string}
}

export interface UnsplashSearchResponse {
  total: number;
  result: UnsplashPictureUrl[]
}











