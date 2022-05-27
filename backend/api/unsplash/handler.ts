import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandler} from "aws-lambda";
import {UnsplashManager} from "./unsplash.manager";
import {S3Service} from "@services/S3.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {PictureMetadataService} from "@services/pictureMetadataService";

export const getPicturesByAKeyWord: APIGatewayProxyHandler = async (event, context) => {
  try {
    const unsplashManager = new UnsplashManager();
    const query = event.queryStringParameters!;

    const response = await unsplashManager.getPicturesByAKeyWord(query);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
};

export const uploadFavoritePictures: APIGatewayProxyHandler = async (event, context) => {
  try {
    const unsplashManager = new UnsplashManager();

    const ids = event.body!;
    const email: string = event.requestContext.authorizer?.lambda.email;
    const metadataService = new PictureMetadataService();
    const pictureDBService = new DynamoDBPicturesService();
    const s3Service = new S3Service();

    const response = await unsplashManager.uploadFavoritePictures(ids, email, metadataService, pictureDBService, s3Service);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err)
  }
}


