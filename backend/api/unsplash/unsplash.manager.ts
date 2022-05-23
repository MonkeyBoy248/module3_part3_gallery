import {UnsplashService} from "./unsplash.service";
import {HttpBadRequestError} from "@floteam/errors";

export class UnsplashManager {
  private readonly service: UnsplashService;

  constructor() {
    this.service = new UnsplashService();
  }

  getPicturesByAKeyWord = async (queryString?: string | null) => {
    if (!queryString) {
      throw new HttpBadRequestError('No query string was provided');
    }

    console.log('query', queryString);

    return this.service.getPicturesByAKeyWord(queryString);
  }
}