import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import {
  APIGatewayProxyHandlerV2, Handler
} from "aws-lambda";
import { AuthManager } from "./auth.manager";
import { APIGatewayAuthorizerSimpleResult, APIGatewayRequestAuthorizerHttpApiPayloadV2Event } from "@interfaces/api-gateway-authorizer.interface";
import {JwtPayload} from "jsonwebtoken";

const manager = new AuthManager();

export const signUp: APIGatewayProxyHandlerV2 = async (event, context) => {
  console.log(event);

  try {
    const user = event.body!;

    const response = await manager.signUp(user);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
}

export const logIn: APIGatewayProxyHandlerV2 = async (event, context) => {
  console.log(event);

  try {
    const user = event.body!
    const token = await manager.logIn(user);

    return createResponse(200, { token });
  } catch (err) {
    return errorHandler(err);
  }
}


export function generateSimpleResponse<C extends APIGatewayAuthorizerSimpleResult['context']>(
  isAuthorized: boolean,
  context: C
): APIGatewayAuthorizerSimpleResult & { context: C } {
  const authResponse: APIGatewayAuthorizerSimpleResult & { context: C } = {
    isAuthorized,
    context,
  };

  return authResponse;
}

export const authenticate: Handler<
  APIGatewayRequestAuthorizerHttpApiPayloadV2Event,
  APIGatewayAuthorizerSimpleResult
  > = async (event, context) => {
  console.log(event);

  try {
    const token = event.identitySource?.[0]

    console.log('token', token);

    const user = await manager.authenticate(token!) as JwtPayload;

    return generateSimpleResponse(true, {email: user.email});
  } catch (err) {
    return generateSimpleResponse(false, {});
  }
}



