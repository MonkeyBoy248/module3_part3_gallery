import { RequestUser } from "./auth.interface";
import { HashPasswordService } from "@services/hashPassword.service";
import { JwtService} from "@services/jwt.service";
import { AlreadyExistsError, HttpBadRequestError, HttpUnauthorizedError } from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";

export class AuthService {
  private readonly dbUserService = new DynamoDBUserService();
  private readonly jwtService = new JwtService();
  private readonly hashService = new HashPasswordService();


  validateUserData = (data: string) => {
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

  signUp = async (userData: RequestUser) => {
    try {
      await this.dbUserService.createUserObjectInDB(userData.email, userData.password);
      const token = await this.logIn(userData);

      return {token}
    } catch (err) {
      throw new AlreadyExistsError(`User with this email already exists, ${err}`)
    }
  }

  logIn = async (userData: RequestUser) => {
    try {
      const contender = await this.dbUserService.getUserByEmail(userData.email);
      console.log('candidate', contender);

      if (!contender) {
        throw new HttpBadRequestError('User does not exist');
      }

      await this.hashService.comparePasswords(contender?.password.hash, contender.password.salt, userData.password);

      return this.jwtService.createToken(contender.email);
    } catch (err) {
      throw new HttpUnauthorizedError('Wrong user data');
    }
  }

  authenticate = async (token: string) => {
    try {

      return this.jwtService.verifyToken(token);
    } catch (err) {
      throw new HttpUnauthorizedError('Invalid token');
    }
  }
}