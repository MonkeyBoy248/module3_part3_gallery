import { RequestUser } from "./auth.interface";
import { HashPasswordService } from "@services/hashPassword.service";
import { JwtService} from "@services/jwt.service";
import { AlreadyExistsError, HttpBadRequestError, HttpUnauthorizedError } from "@floteam/errors";
import {DynamoDBUserService} from "@models/DynamoDB/services/dynamoDBUser.service";

export class AuthService {
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

  signUp = async (userData: RequestUser, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService) => {
    try {
      await dbUserService.createUserObjectInDB(userData.email, userData.password);
      const token = jwtService.createToken(userData.email);

      return token
    } catch (err) {
      throw new AlreadyExistsError(`User with this email already exists, ${err}`)
    }
  }

  logIn = async (userData: RequestUser, dbUserService: DynamoDBUserService, hashService: HashPasswordService, jwtService: JwtService) => {
    const contender = await dbUserService.getUserByEmail(userData.email);

    if (!contender) {
      throw new HttpUnauthorizedError('User does not exist');
    }

    try {
      await hashService.comparePasswords(contender?.password.hash, contender.password.salt, userData.password);

      return jwtService.createToken(contender.email);
    } catch (err) {
      throw new HttpUnauthorizedError('Invalid user data');
    }
  }

  authenticate = async (token: string, jwtService: JwtService) => {
    try {
      return jwtService.verifyToken(token);
    } catch (err) {
      throw new HttpUnauthorizedError('Invalid token');
    }
  }
}