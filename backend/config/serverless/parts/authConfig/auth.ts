import { AWSPartitial } from '../../types';
import {signUp, logIn, httpApiJwtAuthorizer} from "./index";

export const authConfig: AWSPartitial = {
  provider: {
    httpApi: {
      authorizers: {
        httpApiJwtAuthorizer: {
          type: "request",
          functionName: "httpApiJwtAuthorizer",
          identitySource: "$request.header.Authorization",
          enableSimpleResponses: true
        }
      }
    }
  },
  functions: {
   httpApiJwtAuthorizer, signUp, logIn
  },
}