import {DynamoDBService} from "@models/DynamoDB/services/dynamoDB.service";
import {createKeyTemplate} from "@helper/keyTemplate";
import {getEnv} from "@helper/environment";
import {PictureMetadata} from "../../../api/gallery/gallery.interface";

export interface PictureResponse {
  partitionKey: string,
  sortKey: string,
  name: string,
  email: string,
  metadata: PictureMetadata;
  dateOfUploading: string;
  status: string;
}

export interface UpdateParams {
  updatedAttribute: string,
  newValue: string | boolean | number | Object | Buffer
}

export class DynamoDBPicturesService {
  private dynamoDBService = new DynamoDBService();
  private userTableName = getEnv('USERS_TABLE_NAME');
  private userPrefix = getEnv('USER_PREFIX');
  private imagePrefix = getEnv('IMAGE_PREFIX');

  createPictureObjectInDB = async (email: string, metadata: PictureMetadata, pictureId: string) => {
    const partitionKey = createKeyTemplate(this.userPrefix, email);
    const sortKey = createKeyTemplate(this.imagePrefix, pictureId);
    const attributes = {
      name: pictureId,
      email,
      metadata,
      dateOfUploading: new Date().toLocaleDateString(),
      fileOrigin: 'Uploaded',
      subClipCreated: false
    }

    await this.dynamoDBService.putItem(this.userTableName, partitionKey, sortKey, attributes)
  }

  getAllPictures = async (email?: string) => {
    const partitionKey = email ? createKeyTemplate(this.userPrefix, email) : 'Uploaded';
    const partitionKeyName = email ? 'PK' : 'fileOrigin';
    const indexName = email ? undefined : 'AllUserPicturesIndex';

    const keyConditionExpression = `${partitionKeyName} = :u AND begins_with(SK, :i)`;
    const expressionAttributeValues = {
      ':u': `${partitionKey}`,
      ':i': `${this.imagePrefix}#`
    }

    try {
      const pictures = !indexName
        ?
        await this.dynamoDBService.queryItems(this.userTableName, keyConditionExpression, expressionAttributeValues)
        :
        await this.dynamoDBService.queryItems(this.userTableName, keyConditionExpression, expressionAttributeValues, indexName);

      console.log('pictures', pictures.Items);

      return pictures.Items ? pictures.Items as PictureResponse[]: [];
    } catch (e) {
      console.log('err', e)
    }
  }

  updateSubClipCreatedValue = async (email: string, pictureId: string) => {
    const partitionKey = createKeyTemplate(this.userPrefix, email);
    const sortKey = createKeyTemplate(this.imagePrefix, pictureId);
    const updateParams: UpdateParams = {
      updatedAttribute: 'subClipCreated',
      newValue: true
    }

    await this.dynamoDBService.updateItem(this.userTableName, partitionKey, sortKey, updateParams);
  }
}