import mongoose from "mongoose";
import { Picture } from "@interfaces/picture.interface";
import { User } from "@interfaces/user.interface";

const { Schema } = mongoose;

const pictureSchema = new Schema<Picture>(
  {
    path: {
      type: String,
    },
    metadata: {
      type: Object
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
)

export const PictureModel = mongoose.models.Picture as mongoose.Model<Picture> || mongoose.model<Picture>('Picture', pictureSchema);