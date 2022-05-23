import {HashedPassword, HashPasswordService} from '@services/hashPassword.service'
import {AlreadyExistsError} from "@floteam/errors";
import {DynamoDBService} from "@models/DynamoDB/services/dynamoDB.service";
import {getEnv} from "@helper/environment";
import {createKeyTemplate} from "@helper/keyTemplate";

interface UserResponse {
  partitionKey: string,
  sortKey: string,
  email: string,
  password: HashedPassword,
  dateOfRegistration: string;
}

export class DynamoDBUserService {
  private hashService = new HashPasswordService();
  private dynamoDBService = new DynamoDBService();
  private userTableName = getEnv('USERS_TABLE_NAME');
  private userPrefix = getEnv('USER_PREFIX');
  private profilePrefix = getEnv('PROFILE_PREFIX');

  getUserByEmail = async (email: string) => {
    const partitionKey = createKeyTemplate(this.userPrefix!, email);
    const sortKey = createKeyTemplate(this.profilePrefix!, email);
    const user = await this.dynamoDBService.getItem(this.userTableName!, partitionKey, sortKey);

    return user.Item as UserResponse;
  }

  createUserObjectInDB = async (email: string, password: string) => {
   const user = await this.getUserByEmail(email);

   if (user) {
     throw new AlreadyExistsError('User already exists')
   }

   const partitionKey = createKeyTemplate(this.userPrefix!, email);
   const sortKey = createKeyTemplate(this.profilePrefix!, email);
   const passwordObject = await this.hashService.hashPassword(password);
   const attributes = {
     email,
     password: passwordObject,
     dateOfRegistration: new Date().toLocaleDateString(),
   }

   await this.dynamoDBService.putItem(this.userTableName!, partitionKey, sortKey, attributes);
  }
}
