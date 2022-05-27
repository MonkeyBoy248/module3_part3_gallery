export interface GalleryObject {
  objects: string[],
  page: number;
  total: number;
}

export interface RawQueryParams {
  page: string,
  limit: string,
  filter: string,
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

export interface S3PictureMetadata {
  s3PictureBody: Buffer,
  s3PictureMime: string
}

export interface S3CropMetadata {
  cropImage: Buffer,
  pictureId: string,
  cropKey: string
}