import {createApi} from 'unsplash-js';
import fetch from "node-fetch";
import {getEnv} from "@helper/environment";
import {HttpBadRequestError} from "@floteam/errors";
import {UnsplashPictureMetadata, UnsplashSearchResponse} from "./unsplash.interface";
import {S3Service} from "@services/S3.service";
import {v4 as uuidv4} from "uuid";
import imageType from "image-type";
import {DynamoDBPicturesService} from "@models/DynamoDB/services/dynamoDBPictures.service";
import {PictureMetadata} from "../gallery/gallery.interface";
import {PictureMetadataService} from "@services/pictureMetadataService";

export class UnsplashService {
  private bucketName = getEnv('BUCKET_NAME');

  private accessKey = getEnv('UNSPLASH_ACCESS_KEY');
  // @ts-ignore
  private unsplashClient = createApi({accessKey: this.accessKey, fetch});

  getUnsplashPicturesByAKeyWord = async (query: string) => {
    console.log('query in service', query);
    const pictures = await this.unsplashClient.search.getPhotos({
      query,
      page: 1,
      perPage: 10
    })

    if (pictures.type === 'error') {
      throw new HttpBadRequestError('Failed to fetch');
    }

    console.log('pictures', pictures.response?.results)
    console.log('pictures status', pictures.status);
    const result = pictures.response?.results;

    const picturesInfo: UnsplashSearchResponse[] = result.map((picture) => {
      return {
        id: picture.id,
        urls: picture.urls
      }
    })

    return picturesInfo;
  }

  getUnsplashFavoritesMetadata = async (ids: string[]): Promise<UnsplashPictureMetadata[]> => {
    const imagesList = ids.map(this.getUnsplashPictureMetadata)
    const picturesMetadata = await Promise.all(imagesList);

    console.log('info', picturesMetadata)

    return picturesMetadata;
  }

  getUnsplashPictureMetadata = async (id: string): Promise<UnsplashPictureMetadata> => {
    return new Promise(async (resolve, reject) => {
      try {
        const pictureData = await this.unsplashClient.photos.get({photoId: id});

        if (pictureData.errors) {
          reject(pictureData.errors)
        }

        resolve({
          location: pictureData.response?.links.download_location!,
          width: pictureData.response?.width!,
          height: pictureData.response?.height!
        })
      } catch (err) {
        throw new HttpBadRequestError(`Unsplash metadata retrieving failed with error ${err}`)
      }
    })
  }

  getUnsplashFavoritePictureDownloadUrl = async (picture: UnsplashPictureMetadata) => {
    const downloadLink = await this.unsplashClient.photos.trackDownload ({
      downloadLocation: picture.location
    });

    if (downloadLink.errors) {
      throw new HttpBadRequestError('Failed to get download urls');
    }

    picture.downloadUrl = downloadLink.response?.url;

    console.log('download url', downloadLink);
  };



  getUnsplashFavoritePictureBuffer = async (data: UnsplashPictureMetadata) => {
    const response = await fetch(data.downloadUrl!, {
        method: 'get',
      }
    )

    console.log('response', response);
    const pictureBuffer = await response.buffer();
    const size = pictureBuffer.byteLength;
    const type = imageType(pictureBuffer)?.mime || 'image/jpeg';
    
    data.buff = pictureBuffer;
    data.type = type;
    data.size = size;
  }
  
  setDynamoDBMetadataAttribute = async (data: UnsplashPictureMetadata, metadataService: PictureMetadataService): Promise<PictureMetadata> => {
    return new Promise(async (resolve) => {
      try {
        await this.getUnsplashFavoritePictureDownloadUrl(data);
        await this.getUnsplashFavoritePictureBuffer(data);

        const fileExtension = data.type?.split('/').pop();
        const pictureId = `${uuidv4()}.${fileExtension}`.toLowerCase();

        resolve(metadataService.setMetadata(data, pictureId));
      } catch (err) {
        throw new HttpBadRequestError(`Failed to set picture metadata: ${err}`);
      }
    })
  }

  saveUnsplashFavoritesToS3AndDynamoDB = async (data: UnsplashPictureMetadata[], email: string, metadataService: PictureMetadataService, pictureService: DynamoDBPicturesService, s3Service: S3Service) => {
    try {
      const uploadFavoritePictures = data.map(async (item) => {
        const metadata = await this.setDynamoDBMetadataAttribute(item, metadataService);

        console.log('ext', metadata.extension);
        console.log('key', `${email}/${metadata.name}`);

        await s3Service.put(`${email}/${metadata.name}`, item.buff!, this.bucketName);
        await pictureService.createPictureObjectInDB(email, metadata, metadata.name);
      })

      await Promise.all(uploadFavoritePictures);

      return {message: 'Uploaded'};
    } catch (err) {
      throw new HttpBadRequestError(`Failed to save picture: ${err}`)
    }
  }
}