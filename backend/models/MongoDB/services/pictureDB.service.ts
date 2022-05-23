import { Picture } from "@interfaces/picture.interface";
import { PictureModel } from "@models/MongoDB/picture.model";
import { FileService } from "@services/file.service";
import { ObjectId } from "mongodb";
import { HttpInternalServerError } from "@floteam/errors";

export class PicturesDBService {
  private fileService = new FileService();

  createPictureObjectInDB = async (pictureObject: Picture) => {
    await PictureModel.create(pictureObject);
  }

  savePicturesToTheDB = async (pictureObject?: Picture) => {
    if (pictureObject) {
      return this.createPictureObjectInDB(pictureObject);
    }

    const picturesInfo = await this.fileService.getFilesInfo();

    return Promise.all(picturesInfo.fileNames.map(async (fileName, index) => {
      if (await PictureModel.exists({path: fileName}) === null) {
        return this.createPictureObjectInDB({path: fileName, metadata: picturesInfo.metadata[index], owner: null})
      }
    }));
  }

  getTotalImagesAmount = async () => {
    return PictureModel.estimatedDocumentCount();
  }

  setFilterQuery = (ownerId: ObjectId, filter: boolean) => {
    return filter ? { $or: [{ owner: null }, { owner: ownerId }] } : { owner: ownerId };
  }

  getPicturesFromDB = async (ownerId: ObjectId, page, limit, filter: boolean) => {
    let filterQuery = this.setFilterQuery(ownerId, filter);

    try {
      return PictureModel.find(filterQuery, null, {skip: limit * page - limit, limit: limit});
    } catch (err) {
      throw new HttpInternalServerError('Failed to get pictures ', err.message);
    }
  }

  getPicturesAmount = async (ownerId: ObjectId, filter: boolean) => {
    let filterQuery = this.setFilterQuery(ownerId, filter);

    return PictureModel.countDocuments(filterQuery);
  }

  isUserPicturesEmpty = async (id: ObjectId) => {
    return await PictureModel.countDocuments({owner: id}) === 0;
  }
}
