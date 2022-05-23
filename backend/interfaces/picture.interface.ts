import {Stats} from "fs";
import {ObjectId} from "mongodb";

export interface Picture {
  path: string,
  metadata: Stats,
  owner: ObjectId | null,
}