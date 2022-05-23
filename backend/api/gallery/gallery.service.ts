import {DynamoDBPicturesService, PictureResponse} from "@models/DynamoDB/services/dynamoDBPictures.service";
import { GalleryObject, QueryObject } from "./gallery.interface";
import {HttpBadRequestError, HttpInternalServerError} from "@floteam/errors";
import {S3Service} from "@services/S3.service";
import {getEnv} from "@helper/environment";
import {v4 as uuidv4} from "uuid";
import {werePicturesUploadedByASingleUser} from "@helper/checkDuplicates";

export interface PictureMetadata {
  name: string,
  extension: string,
  size: number;
  dimensions: {
    width: number,
    height: number
  }
}

export type OriginInfo = Pick<PictureResponse, 'email' | 'name'>;

export class GalleryService {
  private dbPicturesService = new DynamoDBPicturesService();
  private s3Service = new S3Service();
  private picturesBucketName = getEnv('BUCKET_NAME');

  validateAndConvertParams = async (page: string, limit: string, filter: string, email: string) => {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const filterBool = filter === 'false';
    const totalPagesAmount = (await this.getPictureDataAndPagesAmount(limitNumber, filterBool, email)).total;

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
    } as QueryObject
  }

  private getPictureDataAndPagesAmount = async (limit: number, filter: boolean, email:string) => {
    try {
      const picturesPerPage = limit;
      const picturesTotal = !filter ? await this.dbPicturesService.getAllPictures(email) : await this.dbPicturesService.getAllPictures();
      const totalPages = Math.ceil(picturesTotal!.length / picturesPerPage);

      return {
        total: totalPages,
        pictures: picturesTotal
      }
    } catch (err) {
      throw new HttpInternalServerError('Failed to get pictures amount');
    }
  }

  private createResponseObject = async (array: OriginInfo[], limit: number, page: number, email: string) => {
    const isSingleKind = werePicturesUploadedByASingleUser(array, 'email');
    const picturesForTargetPage = array!.slice((page - 1) * limit, page * limit);

    console.log('target page', picturesForTargetPage, page, limit);

    return Promise.all(
      picturesForTargetPage.map((picture, index) => {
          const checkPattern: boolean = isSingleKind && array.find((item) => item.email === email) !== undefined;

          return this.s3Service.getPreSignedGetUrl(`${checkPattern ? email : picturesForTargetPage[index].email}/${checkPattern ? picture.name : picturesForTargetPage[index].name}`, this.picturesBucketName)
        }))
  }

  getPictures = async (page: number, limit: number, filter: boolean, email: string): Promise<GalleryObject> => {
    try {
      const picturesInfo = await this.getPictureDataAndPagesAmount(limit, filter, email);
      const pictures = picturesInfo.pictures;
      const originInfo: OriginInfo[] = pictures!.map((picture) => {
        return {
          email: picture.email,
          name: picture.name
        }
      });
      console.log('origin', originInfo);
      const total = picturesInfo.total;
      const objects = total !== 0 ? await this.createResponseObject(originInfo!, limit, page, email) : [];

      console.log('objects', objects);

      return  {
        objects,
        total,
        page
      }
    } catch (err) {
      throw new HttpInternalServerError('Failed to create response object')
    }
  }


 uploadPicture = async (email: string, metadata: PictureMetadata) => {
    const fileExtension = metadata.extension.split('/').pop();
    const pictureId = `${uuidv4()}.${fileExtension}`.toLowerCase();

    await this.dbPicturesService.createPictureObjectInDB(email, metadata, pictureId);

    return this.s3Service.getPreSignedPutUrl(`${email}/${pictureId}`, this.picturesBucketName, metadata.extension);
  }

  // uploadDefaultPictures = async () => {
  //   try {
  //     await mongoConnectionService.connectDB();
  //
  //     await this.dbPicturesService.savePicturesToTheDB();
  //
  //     return { message: 'Default pictures were added' };
  //   } catch (err) {
  //     throw new HttpInternalServerError('Failed to upload default images')
  //   }
  // }
}