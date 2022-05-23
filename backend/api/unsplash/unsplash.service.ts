import {createApi} from 'unsplash-js';
import fetch from "node-fetch";
import {getEnv} from "@helper/environment";
import {HttpBadRequestError} from "@floteam/errors";

export class UnsplashService {
  private accessKey = getEnv('UNSPLASH_ACCESS_KEY');
  // @ts-ignore
  private unsplashClient = createApi({accessKey: this.accessKey, fetch});

  getPicturesByAKeyWord = async (query: string) => {
      console.log('query in service', query);
      const pictures = await this.unsplashClient.search.getPhotos({
        query,
        page: 1,
        perPage: 10
      })

      if (pictures.type === 'error') {
        throw new HttpBadRequestError('Failed to fetch');
      }

      console.log('pictures', pictures.response?.results)
      console.log('pictures status', pictures.status);

      return pictures.response?.results;
  }
}