import { AWSPartitial } from '../../types';
import {getUnsplashPictures, uploadFavoritePictures} from "./index";

export const unsplashConfig: AWSPartitial = {
  functions: {
    getUnsplashPictures,
    uploadFavoritePictures
  },
}
