import {GalleryService} from "./gallery.service";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {S3Service} from "@services/S3.service";
import {CropService} from "@services/crop.service";
import {GalleryObject, RawQueryParams} from "./gallery.interface";
import {JoiService} from "@services/joi.service";

export class GalleryManager {
  private readonly service: GalleryService;

  constructor() {
    this.service = new GalleryService();
  }

  public async getPictures (rawQuery: RawQueryParams, email: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service, joiService: JoiService): Promise<GalleryObject> {
    const queryParams = await this.service.convertParams(rawQuery, email, dbPictureService, joiService);

    return this.service.getPictures(queryParams, email, dbPictureService, s3Service);
  }

  public async uploadPicture (data: string, email: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service): Promise<string> {
    const metadata = JSON.parse(data);

    return this.service.uploadPicture(email, metadata, dbPictureService, s3Service);
  }

  async uploadCropImage (pictureKey: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service, cropService: CropService): Promise<void> {
    if (pictureKey.includes('_SC')) {
      return;
    }

    const transformedKey = decodeURIComponent(pictureKey);
    const email = transformedKey.split('/')[0];

    const croppedPictureBody = await this.service.getCroppedPictureBody(transformedKey, s3Service, cropService);
    const croppedPictureS3Key = await this.service.getCroppedPictureS3Key(transformedKey);
    const pictureId = this.service.getPictureId(transformedKey);

    return this.service.uploadCroppedImage(email, croppedPictureBody, pictureId, croppedPictureS3Key, s3Service, dbPictureService);
  }
}
