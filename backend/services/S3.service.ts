import { S3 } from 'aws-sdk';
import {getEnv} from "@helper/environment";
import { PutObjectRequest } from 'aws-sdk/clients/s3';

export class S3Service {
  public s3 = new S3();
  private putExpirationTime = 60 * Number(getEnv('PUT_EXPIRATION_TIME'));
  private getExpirationTime = 60 * Number(getEnv('GET_EXPIRATION_TIME'));

  getPreSignedPutUrl = (key: string, bucket: string, contentType: string) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: this.putExpirationTime,
      ContentType: contentType
    };

    return this.s3.getSignedUrl('putObject', params);
  }

  getPreSignedGetUrl = (key: string, bucket: string) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: this.getExpirationTime
    };
    return this.s3.getSignedUrl('getObject', params);
  }

  public put = (key: string, body: string, bucket: string, acl = 'public-read') => {
    const params: PutObjectRequest = {
      ACL: acl,
      Bucket: bucket,
      Key: key,
      Body: body,
    };
    return this.s3.putObject(params).promise();
  }
}