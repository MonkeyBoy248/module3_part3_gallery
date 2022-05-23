import jwt from 'jsonwebtoken';
import {getEnv} from "@helper/environment";

export class JwtService {
  private secretKey = getEnv('SECRET_KEY');

  createToken = async (data: string) => {
    return jwt.sign({ email: data}, this.secretKey!);
  }

  verifyToken = async (token: string) => {
    return jwt.verify(token, this.secretKey!);
  }
}


