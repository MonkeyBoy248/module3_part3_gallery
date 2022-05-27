import {TokenObject} from "./interfaces.js";
import {TokenError} from "./errors.js";

export class Token {
  private static TOKEN_KEY: string = 'token';

  static getTokenObject (): TokenObject {
    return JSON.parse(localStorage.getItem(Token.TOKEN_KEY) || 'null');
  }

  static getTokenTimestamp (): number | undefined {
    const tokenObj: TokenObject = JSON.parse(localStorage.getItem(Token.TOKEN_KEY) || 'null');

    return tokenObj?.timestamp;
  }

  static getToken () {
    const tokenObject = Token.getTokenObject();

    return tokenObject ? tokenObject.token : null;
  }

  static setToken (token: TokenObject): void {
    try {
      token.timestamp = Date.now();
      localStorage.setItem(Token.TOKEN_KEY, JSON.stringify(token));
    } catch (err) {
      throw new TokenError('Invalid token response');
    }
  }

  static deleteToken (): void {
    const timestamp = Token.getTokenTimestamp();

    if (typeof timestamp === 'number') {
      if (Date.now() - timestamp >= 600000) {
        localStorage.removeItem(Token.TOKEN_KEY);
      }
    }
  }
}