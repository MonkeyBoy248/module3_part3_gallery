import {RequestUser, Token} from "./auth.interface";
import { HashPasswordService } from "@services/hashPassword.service";
import { JwtService} from "@services/jwt.service";
import { AlreadyExistsError, HttpBadRequestError, HttpUnauthorizedError } from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";
import {JwtPayload} from "jsonwebtoken";

export class AuthService {
  public validateUserData (data: string): RequestUser {
    const userData = JSON.parse(data);

    if (!userData.email) {
      throw new HttpBadRequestError('No email was provided');
    }

    if (!userData.password) {
      throw new HttpBadRequestError('No password was provided')
    }

    const userObject: RequestUser = {
      email: userData.email,
      password: userData.password
    }

    return userObject;
  }

  public async signUp (userData: RequestUser, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService): Promise<Token> {
    try {
      await dbUserService.createUserObjectInDB(userData.email, userData.password);
      const token = await jwtService.createToken(userData.email);

      console.log('token', token);

      return {token}
    } catch (err) {
      throw new AlreadyExistsError(`User with this email already exists, ${err}`)
    }
  }

  public async logIn (userData: RequestUser, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService): Promise<string>{
    try {
      const contender = await dbUserService.getUserByEmail(userData.email);

      await hashService.comparePasswords(contender.password.hash, contender.password.salt, userData.password);

      return jwtService.createToken(contender.email);
    } catch (err) {
      throw new HttpUnauthorizedError('Invalid user data');
    }
  }

  public async authenticate (token: string, jwtService: JwtService): Promise<string | JwtPayload>{
    try {
      return jwtService.verifyToken(token);
    } catch (err) {
      throw new HttpUnauthorizedError('Invalid token');
    }
  }
}