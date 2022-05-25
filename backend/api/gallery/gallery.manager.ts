import {GalleryService} from "./gallery.service";

export class GalleryManager {
  private readonly service: GalleryService;

  constructor() {
    this.service = new GalleryService();
  }

  getPictures = async (page: string,  limit: string, filter: string, email: string) => {
    const queryParams = await this.service.validateAndConvertParams(page, limit, filter, email);

    return this.service.getPictures(queryParams.page, queryParams.limit, queryParams.filter, email);
  }

  uploadPicture = async (data: string, email: string) => {
    const metadata = JSON.parse(data);

    return this.service.uploadPicture(email, metadata);
  }

  uploadCropImage = async (pictureKey: string) => {
    if (pictureKey.includes('_SC')) {
      return;
    }

    console.log('picture key in manager', pictureKey);
    const transformedKey = pictureKey.replace('%40', '@');
    console.log('transformed key', transformedKey);

    const croppedPictureBody = await this.service.getCroppedPictureBody(transformedKey);
    const croppedPictureS3Key = await this.service.getCroppedPictureS3Key(transformedKey);
    const pictureId = this.service.getPictureId(transformedKey);

    return this.service.uploadCropImage(croppedPictureBody, pictureId, croppedPictureS3Key);
  }
}
