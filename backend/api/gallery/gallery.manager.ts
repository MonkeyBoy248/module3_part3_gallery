import {GalleryService} from "./gallery.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {S3Service} from "@services/S3.service";
import {CropService} from "@services/crop.service";
import {RawQueryParams} from "./gallery.interface";

export class GalleryManager {
  private readonly service: GalleryService;

  constructor() {
    this.service = new GalleryService();
  }

  getPictures = async (rawQuery: RawQueryParams, email: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service) => {
    const queryParams = await this.service.validateAndConvertParams(rawQuery, email, dbPictureService);

    return this.service.getPictures(queryParams, email, dbPictureService, s3Service);
  }

  uploadPicture = async (data: string, email: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service) => {
    const metadata = JSON.parse(data);

    return this.service.uploadPicture(email, metadata, dbPictureService, s3Service);
  }

  uploadCropImage = async (pictureKey: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service, cropService: CropService) => {
    if (pictureKey.includes('_SC')) {
      return;
    }

    const transformedKey = decodeURIComponent(pictureKey);
    const email = transformedKey.split('/')[0];

    const croppedPictureBody = await this.service.getCroppedPictureBody(transformedKey, s3Service, cropService);
    const croppedPictureS3Key = await this.service.getCroppedPictureS3Key(transformedKey);
    const pictureId = this.service.getPictureId(transformedKey);

    return this.service.uploadCropImage(email, croppedPictureBody, pictureId, croppedPictureS3Key, s3Service, dbPictureService);
  }
}
