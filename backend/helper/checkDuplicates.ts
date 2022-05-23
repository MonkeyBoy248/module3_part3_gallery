import {OriginInfo} from "../api/gallery/gallery.service";

export const werePicturesUploadedByASingleUser = (picturesInfo: OriginInfo[], key: string) => {
  const keyArray = picturesInfo.map((item) => {
    return item[key];
  })

  return new Set(keyArray).size <= 1;
}