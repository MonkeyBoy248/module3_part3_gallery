import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import {APIGatewayProxyHandler, S3Handler} from "aws-lambda";
import { GalleryManager } from "./gallery.manager";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {S3Service} from "@services/S3.service";
import {CropService} from "@services/crop.service";
import {RawQueryParams} from "./gallery.interface";
import {JoiService} from "@services/joi.service";

export const getPictures: APIGatewayProxyHandler = async (event, context) => {
  try {
    const manager = new GalleryManager();

    const email = event.requestContext.authorizer?.lambda.email;
    const queryObject = event.queryStringParameters;
    const rawQueryParams: RawQueryParams = {
      page: queryObject?.page!,
      limit: queryObject?.limit!,
      filter: queryObject?.filter!
    }
    const dbPicturesService = new DynamoDBPicturesService();
    const s3Service = new S3Service();
    const joiService = new JoiService();

    const responseObject = await manager.getPictures(rawQueryParams, email, dbPicturesService, s3Service, joiService);

    return createResponse(200, responseObject);
  } catch (err) {
    return errorHandler(err);
  }
};

export const uploadPicture: APIGatewayProxyHandler = async (event, context) => {
  try {
    const manager = new GalleryManager();

    const metadata = event.body!;
    const email = event.requestContext.authorizer?.lambda.email
    const dbPicturesService = new DynamoDBPicturesService();
    const s3Service = new S3Service();
    const response = await manager.uploadPicture(metadata, email, dbPicturesService, s3Service);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
}

export const s3Uploading: S3Handler = async (event, context) => {
  try {
    const manager = new GalleryManager();

    const pictureKey = event.Records[0].s3.object.key;

    const dbPicturesService = new DynamoDBPicturesService();
    const s3Service = new S3Service();
    const cropService = new CropService();

    await manager.uploadCropImage(pictureKey, dbPicturesService, s3Service, cropService);
  } catch (err) {
    console.log(err);
  }
}


