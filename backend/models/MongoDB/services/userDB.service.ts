import { authorizedUsers } from '@helper/authorizedUsers';
import { UserModel } from '@models/MongoDB/user.model';
import { HashPasswordService } from '@services/hashPassword.service'
import { User } from '@interfaces/user.interface'
import { ObjectId } from "mongodb";
import { RequestUser } from "../../../api/authentication/auth.interface";
import { HttpBadRequestError } from "@floteam/errors";

export class UserDBService {
  private hashService;

  constructor() {
    this.hashService = new HashPasswordService();
  }

  private createUserObjectInDB = async (email, password, salt) => {
    const userObject: User = {
      _id: new ObjectId(),
      email,
      password,
      salt
    } as User;

    await UserModel.create(userObject);
  }

  saveUsersToDB = async (userData?: RequestUser) => {
    if (userData) {
      const email = userData.email;
      const hashedPassword = await this.hashService.hashPassword(userData.password);

      return this.createUserObjectInDB(email, hashedPassword.hash, hashedPassword.salt);
    }

    return Promise.all(authorizedUsers.map(async (user) => {
      const hashedPassword = await this.hashService.hashPassword(user.password);

      if (await UserModel.exists({ email: user.email }) === null) {
        return this.createUserObjectInDB(user.email, hashedPassword.hash, hashedPassword.salt);
      }
    }));
  };

  findUserByEmail = async (email: string): Promise<User> => {
    const user = await UserModel.findOne({email});

    if (user === null) {
      throw new HttpBadRequestError('User does not exist');
    }

    return user;
  }
}
