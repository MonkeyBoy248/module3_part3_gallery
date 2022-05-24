import {UnsplashService} from "./unsplash.service";
import {HttpBadRequestError} from "@floteam/errors";
import {FavoriteIds} from "./unsplash.interface";

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

  getFavoritesUploadLinks = async (id: string | undefined | null) => {
    if (!id) {
      throw new HttpBadRequestError('No ids was provided');
    }

    const pictureIDArray: FavoriteIds = JSON.parse(id);

    console.log('ids object', pictureIDArray.ids);

    return this.service.getFavoritesUploadLinks(pictureIDArray.ids);
  }
}