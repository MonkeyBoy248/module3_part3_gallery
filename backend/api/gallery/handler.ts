import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import {APIGatewayProxyHandler, S3Handler} from "aws-lambda";
import { GalleryManager } from "./gallery.manager";

const manager = new GalleryManager();

export const getPictures: APIGatewayProxyHandler = async (event, context) => {
  try {
    const email = event.requestContext.authorizer?.lambda.email;
    const queryObject = event.queryStringParameters;
    const page = queryObject?.page ?? '1';
    const limit = queryObject?.limit ?? '4';
    const filter = queryObject?.filter ?? 'false';

    const responseObject = await manager.getPictures(page, limit, filter, email);

    return createResponse(200, responseObject);
  } catch (err) {
    return errorHandler(err);
  }
};

export const uploadPicture: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);

  try {
    const metadata = event.body!;
    const email = event.requestContext.authorizer?.lambda.email
    const response = await manager.uploadPicture(metadata, email);

    console.log('email', email);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
}

export const s3Uploading: S3Handler = async (event, context) => {
  try {
    const pictureKey = event.Records[0].s3.object.key;

    await manager.uploadCropImage(pictureKey);
  } catch (err) {
    console.log(err);
  }
}


