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

  // uploadDefaultPictures = async () => {
  //   return this.service.uploadDefaultPictures();
  // }
}
