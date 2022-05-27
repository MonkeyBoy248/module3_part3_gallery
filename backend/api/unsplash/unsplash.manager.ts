import {UnsplashService} from "./unsplash.service";
import {HttpBadRequestError} from "@floteam/errors";
import {FavoriteIds, UnsplashPictures} from "./unsplash.interface";
import {S3Service} from "@services/S3.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {PictureMetadataService} from "@services/pictureMetadataService";
import {APIGatewayProxyEventQueryStringParameters} from "aws-lambda";
import {RawQueryParams} from "../gallery/gallery.interface";

export class UnsplashManager {
  private readonly service: UnsplashService;

  constructor() {
    this.service = new UnsplashService();
  }

  public async getPicturesByAKeyWord (queryString:  APIGatewayProxyEventQueryStringParameters): Promise<UnsplashPictures> {
    if (!queryString) {
      throw new HttpBadRequestError('No query string was provided');
    }

    if (!queryString.page || !queryString.limit) {
      throw new HttpBadRequestError('No page or limit value was provided');
    }

    const query: Omit<RawQueryParams, 'filter'> = {
      page: queryString.page,
      limit: queryString.limit,
      keyWord: queryString.keyWord
    }
    const unsplashResponse = await this.service.getUnsplashPicturesResponse(query);

    return this.service.getUnsplashPictures(unsplashResponse, Number(query.limit), Number(query.page));
  }

  public async uploadFavoritePictures (id: string, email: string, metadataService: PictureMetadataService, pictureDBService: DynamoDBPicturesService, s3Service: S3Service): Promise<void> {
    if (!id) {
      throw new HttpBadRequestError('No ids was provided');
    }

    const pictureIDArray: FavoriteIds = JSON.parse(id);
    const favoritesMetadata = await this.service.getUnsplashFavoritesMetadata(pictureIDArray.ids);

    return this.service.saveUnsplashFavoritesToS3AndDynamoDB(favoritesMetadata, email, metadataService, pictureDBService, s3Service);
  }
}