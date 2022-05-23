import {UnsplashService} from "./unsplash.service";
import {HttpBadRequestError} from "@floteam/errors";
import {PicturesQuery} from "./unsplash.interface";

export class UnsplashManager {
  private readonly service: UnsplashService;

  constructor() {
    this.service = new UnsplashService();
  }

  getPicturesByAKeyWord = async (queryString?: string | null) => {
    if (!queryString) {
      throw new HttpBadRequestError('No query string was provided');
    }

    const queryObject: PicturesQuery = JSON.parse(queryString);
    const query = queryObject.query;

    console.log('query', query);

    return this.service.getPicturesByAKeyWord(query);
  }
}