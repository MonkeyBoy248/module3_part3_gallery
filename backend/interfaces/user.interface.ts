import {ObjectId} from "mongodb";

export interface User {
  _id: ObjectId | null,
  email: string;
  password: string;
  salt: string;
}