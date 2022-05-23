import { paths } from '@helper/paths/paths'
import {Stats} from 'fs';
import fs from 'fs';
import path from 'path';
import { MultipartFile } from 'lambda-multipart-parser';
import { HttpInternalServerError } from "@floteam/errors";

interface FileInfo {
  fileNames: string[];
  metadata: Stats[];
}

export class FileService {
  private path = paths.API_IMAGES_PATH;

  getFilesInfo = async (): Promise<FileInfo> => {
    console.log(paths.API_IMAGES_PATH);
    try {
      const fileNames = await fs.promises.readdir(this.path);
      const metadata: Stats[] = await Promise.all(fileNames.map(async (name) => {
        return fs.promises.stat(path.join(this.path, name));
      }));

      const fileInfo: FileInfo = {
        fileNames,
        metadata
      }

      return fileInfo;
    } catch (err) {
      throw new HttpInternalServerError('Failed to get file names list')
    }
  }

  saveFileWithANewName = async (fileData: MultipartFile, picturesAmount: number) => {
    const fileName = fileData.filename;
    try {
      const pictureName = `user_image_${picturesAmount + 1}${fileName.slice(fileName.indexOf('.'))}`;

      await fs.promises.writeFile(
        path.join(this.path, pictureName),
        fileData.content
      );

      return pictureName;
    } catch (err) {
      throw new HttpInternalServerError('Failed to rename file');
    }
  }
}
