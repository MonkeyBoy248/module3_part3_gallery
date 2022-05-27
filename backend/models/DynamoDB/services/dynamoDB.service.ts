import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient, GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput, QueryCommand, QueryCommandInput,
  TranslateConfig, UpdateCommand, UpdateCommandInput
} from "@aws-sdk/lib-dynamodb";
import {getEnv} from "@helper/environment";
import {HashedPassword} from "@services/hashPassword.service";
import {PictureMetadata} from "../../../api/gallery/gallery.interface";
import {UpdateParams} from "@models/DynamoDB/services/dynamoDBPictures.service";
interface Attributes {
  email?: string,
  password?: HashedPassword,
  metadata?: PictureMetadata,
  dateOfRegistration?: string,
  dateOfUploading?: string,
  status?: string
}

interface ExpressionAttributeValue {
  [value: string]: unknown;
}


export class DynamoDBService {
  private readonly dynamoClient: DynamoDBClient;
  private dynamoDocumentClient: DynamoDBDocumentClient;

  constructor() {
    const marshallOptions = {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: false,
    };
    const unmarshallOptions = {
      wrapNumbers: false,
    };
    const translateConfig: TranslateConfig = {marshallOptions, unmarshallOptions};

    console.log(getEnv('REGION'));
    this.dynamoClient = new DynamoDBClient({region: getEnv('REGION')});
    this.dynamoDocumentClient = DynamoDBDocumentClient.from(this.dynamoClient, translateConfig);
  }

  putItem = async (tableName: string, partitionKey: string, sortKey: string, attributes: Attributes) => {
    const params: PutCommandInput = {
      TableName: tableName,
      Item: {
        PK: partitionKey,
        SK: sortKey,
        ...attributes
      }
    }

    return this.dynamoDocumentClient.send(new PutCommand(params))
  }

  getItem = async (tableName: string, partitionKey: string, sortKey: string, projection?: string[]) => {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: {
        PK: partitionKey,
        SK: sortKey
      }
    }

    if (projection) {
      params.ProjectionExpression = projection.join(', ');
    }

    return this.dynamoDocumentClient.send(new GetCommand(params))
  }

  queryItems = async (tableName: string, keyConditionExpression: string, expressionAttributeValues: ExpressionAttributeValue, indexName?: string) => {
    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }

    if (indexName) {
      params.IndexName = indexName;
    }

    console.log('i', params.IndexName);

    return this.dynamoDocumentClient.send(new QueryCommand(params));
  }

  updateItem = async (tableName: string, partitionKey: string, sortKey: string, updateParams: UpdateParams) => {
    const {updatedAttribute, newValue} = updateParams;
    console.log('updated attr', updatedAttribute);
    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: {
        PK: partitionKey,
        SK: sortKey,
      },
      ExpressionAttributeNames: {
        '#t': updatedAttribute
      },
      ExpressionAttributeValues: {
        ':v': newValue
      },
      UpdateExpression: `set #t = :v`,
    }

    return this.dynamoDocumentClient.send(new UpdateCommand(params));
  }
}