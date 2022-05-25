export interface GalleryObject {
  objects: string[],
  page: number;
  total: number;
}

export interface QueryObject {
  page: number,
  limit: number,
  filter: boolean,
}

export interface PictureMetadata {
  name: string,
  extension: string,
  size: number;
  dimensions: {
    width: number,
    height: number
  }
}