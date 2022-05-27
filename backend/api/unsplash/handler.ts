import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandler} from "aws-lambda";
import {UnsplashManager} from "./unsplash.manager";
import {S3Service} from "@services/S3.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {PictureMetadataService} from "@services/pictureMetadataService";

const unsplashManager = new UnsplashManager();

export const getPicturesByAKeyWord: APIGatewayProxyHandler = async (event, context) => {
  try {
    const query = event.queryStringParameters;
    console.log('event body', query?.keyWord);
    const response = await unsplashManager.getPicturesByAKeyWord(query?.keyWord);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
};

export const uploadFavoritePictures: APIGatewayProxyHandler = async (event, context) => {
  try {
    const ids = event.body;
    const email = event.requestContext.authorizer?.lambda.email;
    console.log('Favorite ids', ids);
    const metadataService = new PictureMetadataService();
    const pictureDBService = new DynamoDBPicturesService();
    const s3Service = new S3Service();
    const response = await unsplashManager.uploadFavoritePictures(ids, email, metadataService, pictureDBService, s3Service);
    console.log('upload favorite response', response);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err)
  }
}


