import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandler} from "aws-lambda";
import { GalleryManager } from "./gallery.manager";

const manager = new GalleryManager();

export const getPictures: APIGatewayProxyHandler = async (event, context) => {
  console.log(event);

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



// export const uploadUserPicture: APIGatewayProxyHandler = async (event, context) => {
//   console.log(event);
//
//   try {
//     const manager = new GalleryManager();
//
//
//     const email = event.requestContext.authorizer?.jwt.claims.email as string;
//     const file = await multipartParser.parse(event);
//     const response = await manager.uploadUserPicture(file, email);
//
//     return createResponse(200, response);
//   } catch (err) {
//     return errorHandler(err);
//   }
// }

// export const uploadDefaultPictures: APIGatewayProxyHandlerV2 = async (event, context) => {
//   console.log(event);
//
//   try {
//     const manager = new GalleryManager();
//
//     const response = await manager.uploadDefaultPictures();
//
//     return createResponse(200, response);
//   } catch (err) {
//     return errorHandler(err);
//   }
// }

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


