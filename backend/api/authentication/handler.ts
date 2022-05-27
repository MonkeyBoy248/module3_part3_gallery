import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import {
  APIGatewayProxyHandlerV2, Handler
} from "aws-lambda";
import { AuthManager } from "./auth.manager";
import { APIGatewayAuthorizerSimpleResult, APIGatewayRequestAuthorizerHttpApiPayloadV2Event } from "@interfaces/api-gateway-authorizer.interface";
import {JwtPayload} from "jsonwebtoken";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";
import {JwtService} from "@services/jwt.service";
import {HashPasswordService} from "@services/hashPassword.service";
import {JoiService} from "@services/joi.service";

export const signUp: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    const manager = new AuthManager();

    const user = event.body!;
    const dbUserService = new DynamoDBUserService();
    const jwtService = new JwtService();
    const hashService = new HashPasswordService();
    const joiService = new JoiService();

    const response = await manager.signUp(user, dbUserService, hashService, jwtService, joiService);

    return createResponse(200, response);
  } catch (err) {
    return errorHandler(err);
  }
}

export const logIn: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    const manager = new AuthManager();

    const user = event.body!
    const dbUserService = new DynamoDBUserService();
    const jwtService = new JwtService();
    const hashService = new HashPasswordService();
    const joiService = new JoiService();

    const token = await manager.logIn(user, dbUserService, hashService, jwtService, joiService);

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
  try {
    const manager = new AuthManager();

    const token = event.identitySource?.[0]
    const jwtService = new JwtService();
    const user = await manager.authenticate(token!, jwtService) as JwtPayload;

    return generateSimpleResponse(true, {email: user.email});
  } catch (err) {
    return generateSimpleResponse(false, {});
  }
}



