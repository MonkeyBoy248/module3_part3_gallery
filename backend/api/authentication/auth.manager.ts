import { AuthService } from "./auth.service";
import {HttpBadRequestError, HttpUnauthorizedError} from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";
import {HashPasswordService} from "@services/hashPassword.service";
import {JwtService} from "@services/jwt.service";
import {Token} from "./auth.interface";
import {JwtPayload} from "jsonwebtoken";

export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public async signUp (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService):  Promise<Token>{
    const user = this.service.validateUserData(data);

    return this.service.signUp(user, dbUserService, hashService, jwtService);
  }

  public async logIn (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService): Promise<string>{
    if (!data) {
      throw new HttpBadRequestError('No user data provided');
    }

    const user = this.service.validateUserData(data);

    return this.service.logIn(user, dbUserService, hashService, jwtService);
  }

  public async authenticate (token: string, jwtService: JwtService): Promise<string | JwtPayload>{
    if (!token) {
      throw new HttpUnauthorizedError('No token was provided');
    }

    return this.service.authenticate(token, jwtService);
  }
}
