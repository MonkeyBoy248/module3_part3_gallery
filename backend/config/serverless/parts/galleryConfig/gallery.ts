import { AWSPartitial } from '../../types';
import { getPictures, uploadDefaultPictures, uploadPicture } from "./index";

export const galleryConfig: AWSPartitial = {
  functions: {
    getPictures, uploadDefaultPictures, uploadPicture
  },
}
