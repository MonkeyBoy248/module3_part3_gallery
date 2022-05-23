import { AuthService } from "./auth.service";
import { HttpUnauthorizedError } from "@floteam/errors";

export class AuthManager {
  private readonly service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  signUp = async (data: string) => {
    const user = this.service.validateUserData(data);

    return this.service.signUp(user);
  }

  logIn = async (data: string) => {
    const user = this.service.validateUserData(data);

    return this.service.logIn(user);
  }

  authenticate = async (token: string) => {
    try {
      return this.service.authenticate(token);
    } catch {
      throw new HttpUnauthorizedError('No token was provided');
    }
  }
}
