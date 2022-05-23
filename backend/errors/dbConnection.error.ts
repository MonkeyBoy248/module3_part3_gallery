import { RuntimeError } from "@floteam/errors/runtime/runtime-error";

export class DbConnectionError extends RuntimeError {
  constructor(message : string) {
    super(message);
    this.name = 'DBConnectionError';
  }
}