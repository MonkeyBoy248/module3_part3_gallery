export interface TokenObject {
  token: string;
  timestamp?: number;
}

export interface User {
  email: string;
  password: string;
}

interface Pictures {
  id: number,
  path: string,
  metadata: object[];
}

export interface GalleryData {
  objects: string[],
  page: number;
  total: number;
}

export interface UnsplashSearchResponse {
  id: string,
  urls: {full: string, raw: string, regular: string, small: string, thumb: string}
}











