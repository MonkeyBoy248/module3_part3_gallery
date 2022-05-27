import { AuthService } from "./auth.service";
import {HttpBadRequestError, HttpUnauthorizedError} from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";
import {HashPasswordService} from "@services/hashPassword.service";
import {JwtService} from "@services/jwt.service";
import {RequestUser, Token} from "./auth.interface";
import {JwtPayload} from "jsonwebtoken";
import {JoiService} from "@services/joi.service";

export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public async signUp (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService, joiService: JoiService): Promise<Token>{
    const user: RequestUser = JSON.parse(data);
    const validateUser = await this.service.validateUserData(user, joiService);

    return this.service.signUp(validateUser, dbUserService, hashService, jwtService);
  }

  public async logIn (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService, joiService: JoiService): Promise<string>{
    if (!data) {
      throw new HttpBadRequestError('No user data provided');
    }

    const user: RequestUser = JSON.parse(data);
    const validatedUser = await this.service.validateUserData(user, joiService);

    return this.service.logIn(validatedUser, dbUserService, hashService, jwtService);
  }

  public async authenticate (token: string, jwtService: JwtService): Promise<string | JwtPayload>{
    if (!token) {
      throw new HttpUnauthorizedError('No token was provided');
    }

    return this.service.authenticate(token, jwtService);
  }
}
