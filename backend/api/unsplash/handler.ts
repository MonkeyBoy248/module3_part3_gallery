import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandler} from "aws-lambda";
import {UnsplashManager} from "./unsplash.manager";

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

export const getFavoritesUploadLinks: APIGatewayProxyHandler = async (event, context) => {
  try {
    const ids = event.body;
    console.log('Favorite id', ids);
    const response = await unsplashManager.getFavoritesUploadLinks(ids);
    console.log('Download link', response);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err)
  }
}


