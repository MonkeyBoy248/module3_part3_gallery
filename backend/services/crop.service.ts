import Jimp from 'jimp'
import {HttpBadRequestError} from "@floteam/errors";

export class CropService {
  private cropWidth = 512;
  private cropHeight = 240;

  cropImage = async (buff: Buffer) => {
    if (!buff) {
      throw new HttpBadRequestError('No image buffer was provided');
    }

    const image = await Jimp.read(buff);
    const crop = image.resize(this.cropWidth, this.cropHeight).getBufferAsync('image/jpeg');

    return crop;
  }
}