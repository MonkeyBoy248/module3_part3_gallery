import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandler} from "aws-lambda";
import {UnsplashManager} from "./unsplash.manager";

const unsplashManager = new UnsplashManager();

export const getPicturesByAKeyWord: APIGatewayProxyHandler = async (event, context) => {
  try {
    const query = event.body;
    console.log('event body', query);
    const response = await unsplashManager.getPicturesByAKeyWord(query);

    return createResponse(200, response);
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


