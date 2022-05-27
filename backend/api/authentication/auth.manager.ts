import { AuthService } from "./auth.service";
import { HttpUnauthorizedError } from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";
import {HashPasswordService} from "@services/hashPassword.service";
import {JwtService} from "@services/jwt.service";

export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  signUp = async (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService) => {
    const user = this.service.validateUserData(data);

    return this.service.signUp(user, dbUserService, hashService, jwtService);
  }

  logIn = async (data: string, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService) => {
    const user = this.service.validateUserData(data);

    return this.service.logIn(user, dbUserService, hashService, jwtService);
  }

  authenticate = async (token: string, jwtService: JwtService) => {
    try {
      return this.service.authenticate(token, jwtService);
    } catch {
      throw new HttpUnauthorizedError('No token was provided');
    }
  }
}
