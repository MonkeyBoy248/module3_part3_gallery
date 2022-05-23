import {TokenObject} from "./interfaces.js";

export class Token {
  private static TOKEN_KEY: string = 'token';

  static getToken (): TokenObject {
    return JSON.parse(localStorage.getItem(Token.TOKEN_KEY) || 'null');
  }

  static getTokenTimestamp (): number | undefined {
    const tokenObj: TokenObject = JSON.parse(localStorage.getItem(Token.TOKEN_KEY) || 'null');

    return tokenObj?.timestamp;
  }

  static setToken (token: TokenObject): void {
    token.timestamp = Date.now();
    localStorage.setItem(Token.TOKEN_KEY, JSON.stringify(token));
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