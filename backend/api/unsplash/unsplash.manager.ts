import {UnsplashService} from "./unsplash.service";
import {HttpBadRequestError} from "@floteam/errors";
import {FavoriteIds} from "./unsplash.interface";
import {S3Service} from "@services/S3.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {PictureMetadataService} from "@services/pictureMetadataService";

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

    return this.service.getUnsplashPicturesByAKeyWord(queryString);
  }

  uploadFavoritePictures = async (id: string | undefined | null, email: string, metadataService: PictureMetadataService, pictureDBService: DynamoDBPicturesService, s3Service: S3Service) => {
    if (!id) {
      throw new HttpBadRequestError('No ids was provided');
    }

    const pictureIDArray: FavoriteIds = JSON.parse(id);
    const favoritesMetadata = await this.service.getUnsplashFavoritesMetadata(pictureIDArray.ids);

    return this.service.saveUnsplashFavoritesToS3AndDynamoDB(favoritesMetadata, email, metadataService, pictureDBService, s3Service);
  }
}