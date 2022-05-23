import crypto from 'crypto';
import { promisify } from "util";
import { HttpUnauthorizedError } from "@floteam/errors";

export interface HashedPassword {
  hash: string,
  salt: string
}

const scryptAsync = promisify< crypto.BinaryLike,  crypto.BinaryLike, number, Buffer>(crypto.scrypt);

export class HashPasswordService {
  hashPassword = async (data: string): Promise<HashedPassword> => {
    const salt = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await scryptAsync(data, salt, 64);

    const hash: HashedPassword = {
      hash: `${salt}${hashedPassword.toString('hex')}`,
      salt
    };

    return hash;
  }

  comparePasswords = async (data: string, salt: string, barePassword: string) => {
    const hashedUserPassword = await scryptAsync(barePassword, salt, 64);
    const isValid = `${salt}${hashedUserPassword.toString('hex')}` === data

     if (!isValid) {
       throw new HttpUnauthorizedError('Invalid password');
     }
  }
}
