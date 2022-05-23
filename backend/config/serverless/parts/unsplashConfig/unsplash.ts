import { AWSPartitial } from '../../types';
import {getUnsplashPictures} from "./index";

export const unsplashConfig: AWSPartitial = {
  functions: {
    getUnsplashPictures
  },
}
