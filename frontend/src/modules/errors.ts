export class TokenError extends Error {
  constructor (message?: string) {
    super(message);
    this.name = 'InvalidToken';
  }
}

export class InvalidPageError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'InvalidPageNumber';
  }
}

export class PicturesUploadError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'PicturesUploadError';
  }
}

export class InvalidUserDataError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidUserDataError'
  }
}