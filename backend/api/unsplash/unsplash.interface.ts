export interface UnsplashSearchResponse {
  id: string,
  urls: {full: string, raw: string, regular: string, small: string, thumb: string}
}

export interface FavoriteIds {
  ids: string[];
}

export interface UnsplashPictureMetadata {
  buff?: Buffer;
  type?: string;
  size?: number;
  location: string;
  width: number;
  height: number;
  downloadUrl?: string;
}

export interface UnsplashPictures {
  total: number;
  result: UnsplashSearchResponse[];
}