import {DynamoDBPicturesService, PictureResponse} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {GalleryObject, PictureMetadata, QueryObject, RawQueryParams} from "./gallery.interface";
import {HttpBadRequestError, HttpInternalServerError} from "@floteam/errors";
import {S3Service} from "@services/S3.service";
import {getEnv} from "@helper/environment";
import {v4 as uuidv4} from "uuid";
import {werePicturesUploadedByASingleUser} from "@helper/checkDuplicates";
import {CropService} from "@services/crop.service";
import {JoiService} from "@services/joi.service";
import {countPagesAmount} from "@helper/countPagesAmount";

export type PictureOwner = Pick<PictureResponse, 'email' | 'name'>;

export class GalleryService {
  private picturesBucketName = getEnv('BUCKET_NAME');

  convertParams = async (rawQuery: RawQueryParams, email: string, dbPictureService: DynamoDBPicturesService, joiService: JoiService): Promise<QueryObject> => {
    let validatedParams: RawQueryParams | undefined;

    try {
      validatedParams = await joiService.validateQueryObject(rawQuery);
    } catch (err) {
      console.log(err);
    }

    if (!validatedParams) {
      throw new HttpBadRequestError('Invalid query parameters');
    }

    const pageNumber = parseInt(validatedParams.page);
    const limitNumber = parseInt(validatedParams.limit);
    const filterBool = validatedParams.filter === 'false';

    return {
      page: pageNumber,
      limit: limitNumber,
      filter: filterBool
    };
  }

  private setS3PictureKey (email: string, owners: PictureOwner[], picturesForTargetPage: PictureOwner[], picture: PictureOwner, index: number): string {
    const uploadedByASingleUser = werePicturesUploadedByASingleUser(owners, 'email');
    const isThisLoggedInUser = owners.find((item) => item.email === email) !== undefined;
    const checkPattern = uploadedByASingleUser && isThisLoggedInUser;
    const folderName = checkPattern ? email : picturesForTargetPage[index].email;
    const fileName = checkPattern ? picture.name : picturesForTargetPage[index].name;

    return `${folderName}/${fileName}`;
  }

  private async getPicturesUrls (owners: PictureOwner[], query: Omit<QueryObject, 'filter'>, email: string, s3Service: S3Service): Promise<string[]> {
    const picturesForTargetPage = owners!.slice((query.page - 1) * query.limit, query.page * query.limit);

    return Promise.all(
      picturesForTargetPage.map((picture, index) => {
          const s3PictureKey = this.setS3PictureKey(email, owners, picturesForTargetPage, picture, index);

          return s3Service.getPreSignedGetUrl(s3PictureKey, this.picturesBucketName)
        }))
  }

  public async getPictures (query: QueryObject, email: string, dbPictureService: DynamoDBPicturesService, s3Service: S3Service): Promise<GalleryObject> {
    let pictures: PictureResponse[] | undefined;
    let total: number;

    try {
      pictures = !query.filter ? await dbPictureService.getAllPictures(email) : await dbPictureService.getAllPictures();
      total = countPagesAmount(pictures!.length, query.limit);
    } catch (err) {
      throw new HttpBadRequestError('Failed to retrieve pictures from DB');
    }

    if (!pictures) {
      throw new HttpBadRequestError('Failed to create response object');
    }

    if ((query.page < 1 || query.page > total) && total !== 0) {
      throw new HttpBadRequestError('Invalid page number');
    }

    try {
      const owner: PictureOwner[] = pictures!.map((picture) => {
        return {
          email: picture.email,
          name: picture.name
        }
      });

      const objects = total !== 0 ? await this.getPicturesUrls(owner!, query, email, s3Service) : [];

      return  {
        objects,
        total,
        page: query.page
      }
    } catch (err) {
      throw new HttpInternalServerError('Failed to get pictures urls')
    }
  }

  public async uploadPicture (email: string, metadata: PictureMetadata, dbPictureService: DynamoDBPicturesService, s3Service: S3Service): Promise<string>{
    const fileExtension = metadata.extension.split('/').pop();
    const pictureId = `${uuidv4()}.${fileExtension}`.toLowerCase();

    await dbPictureService.createPictureObjectInDB(email, metadata, pictureId);

    return s3Service.getPreSignedPutUrl(`${email}/${pictureId}`, this.picturesBucketName, metadata.extension);
  }

  public async getCroppedPictureBody (pictureKey: string, s3Service: S3Service, cropService: CropService): Promise<Buffer> {
    const uploadedFullSizeImage = await s3Service.get(pictureKey, this.picturesBucketName);
    const uploadedPictureBody = uploadedFullSizeImage.Body as Buffer;

    return cropService.cropImage(uploadedPictureBody);
  }

  public async getCroppedPictureS3Key (pictureKey: string): Promise<string> {
    const pictureIdWithNoExtension = pictureKey.split('/').pop()?.split('.')[0];
    const pictureExtension = pictureKey.split('.').pop();
    const email = pictureKey.split('/')[0];
    const croppedPictureS3Key = `${email}/${pictureIdWithNoExtension}_SC.${pictureExtension}`;

    return croppedPictureS3Key;
  }

  public getPictureId (pictureKey: string): string {
    const pictureId = pictureKey.split('/').pop()!;

    return pictureId;
  }

  public async uploadCroppedImage (email: string, croppedPicture: Buffer, pictureId: string, cropKey: string, s3Service: S3Service, dbPictureService: DynamoDBPicturesService): Promise<void>{
    await s3Service.put(cropKey, croppedPicture, this.picturesBucketName);

    await dbPictureService.updateSubClipCreatedValue(email, pictureId!);
  }
}