import mongoose from "mongoose";
import { User } from "@interfaces/user.interface";

const { Schema } = mongoose;

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    salt: {
      type: String
    }
  }
)

export const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User', userSchema);