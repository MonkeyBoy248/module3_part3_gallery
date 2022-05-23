export interface GalleryObject {
  objects: string[];
  page: number;
  total: number;
}

export interface QueryObject {
  page: number,
  limit: number,
  filter: boolean,
}