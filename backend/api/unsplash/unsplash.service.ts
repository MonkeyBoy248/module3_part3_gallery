import {createApi} from 'unsplash-js';
import fetch from "node-fetch";
import {getEnv} from "@helper/environment";
import {HttpBadRequestError} from "@floteam/errors";
import {UnsplashSearchResponse} from "./unsplash.interface";

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
    const result = pictures.response?.results;

    const picturesInfo: UnsplashSearchResponse[] = result.map((picture) => {
      return {
        id: picture.id,
        urls: picture.urls
      }
    })

    return picturesInfo;
  }

  getFavoritesUploadLinks = async (ids: string[]) => {
    console.log('id array', ids);
    const pictureLinks = await Promise.all(ids.map(async (id) => {
      const pictureData = await this.unsplashClient.photos.get({photoId: id});

      if (pictureData.errors) {
        throw new HttpBadRequestError('Failed to retrieve picture data');
      }

      const pictureDownloadLink = pictureData.response?.links.download_location;

      console.log(`picture ${id}`, pictureDownloadLink);

      return pictureDownloadLink;
    }))

    return pictureLinks;
  }
}