import {DynamoDBPicturesService, PictureResponse} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {GalleryObject, PictureMetadata, QueryObject, RawQueryParams} from "./gallery.interface";
import {HttpBadRequestError, HttpInternalServerError} from "@floteam/errors";
import {S3Service} from "@services/S3.service";
import {getEnv} from "@helper/environment";
import {v4 as uuidv4} from "uuid";
import {werePicturesUploadedByASingleUser} from "@helper/checkDuplicates";
import {CropService} from "@services/crop.service";

export type PictureOwner = Pick<PictureResponse, 'email' | 'name'>;

export class GalleryService {
  private picturesBucketName = getEnv('BUCKET_NAME');

  validateAndConvertParams = async (rawQuery: RawQueryParams, email: string, dbPictureService: DynamoDBPicturesService): Promise<QueryObject> => {
    const pageNumber = parseInt(rawQuery.page, 10);
    const limitNumber = parseInt(rawQuery.limit, 10);
    const filterBool = rawQuery.filter === 'false';
    const totalPagesAmount = (await this.getDBPicturesAndPagesAmount({limit: limitNumber, filter: filterBool}, email, dbPictureService)).total;

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new HttpBadRequestError('Page or limit value is not a number');
    }

    if (!isFinite(pageNumber) || !isFinite(limitNumber)) {
      throw new HttpBadRequestError('Invalid query parameters');
    }

    if ((pageNumber < 1 || pageNumber > totalPagesAmount) && totalPagesAmount !== 0) {
      throw new HttpBadRequestError('Invalid page number');
    }

    return {
      page: pageNumber,
      limit: limitNumber,
      filter: filterBool
    };
  }

  private async getDBPicturesAndPagesAmount (query: Omit<QueryObject, 'page'>, email:string, dbPictureService: DynamoDBPicturesService){
    try {
      const picturesPerPage = query.limit;
      const picturesTotal = !query.filter ? await dbPictureService.getAllPictures(email) : await dbPictureService.getAllPictures();
      const totalPages = Math.ceil(picturesTotal!.length / picturesPerPage);

      return {
        total: totalPages,
        pictures: picturesTotal
      }
    } catch (err) {
      throw new HttpInternalServerError('Failed to get pictures amount');
    }
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
    try {
      const dbPictures = await this.getDBPicturesAndPagesAmount(query, email, dbPictureService);
      const pictures = dbPictures.pictures;
      const owner: PictureOwner[] = pictures!.map((picture) => {
        return {
          email: picture.email,
          name: picture.name
        }
      });

      const total = dbPictures.total;
      const objects = total !== 0 ? await this.getPicturesUrls(owner!, query, email, s3Service) : [];

      console.log('objects', objects);

      return  {
        objects,
        total,
        page: query.page
      }
    } catch (err) {
      throw new HttpInternalServerError('Failed to create response object')
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