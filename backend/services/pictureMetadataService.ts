import {UnsplashPictureMetadata} from "../api/unsplash/unsplash.interface";
import {PictureMetadata} from "../api/gallery/gallery.interface";

export class PictureMetadataService {
  setMetadata = (picture: UnsplashPictureMetadata, name: string): PictureMetadata => {
    const fileExtension = picture.type!;
    const size = picture.size!;
    const {width, height} = picture;
    return {
      name,
      extension: fileExtension,
      size,
      dimensions: {
        width,
        height
      }
    }
  }
}