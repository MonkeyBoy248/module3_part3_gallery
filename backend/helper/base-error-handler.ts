import { HttpError } from '@floteam/errors/http/http-error';
import { RuntimeError } from '@floteam/errors/runtime/runtime-error';
import { convertToHttpError } from '@floteam/errors/util';
import { AxiosError } from 'axios';


export function baseErrorHandler(caughtError: Error | HttpError | AxiosError | RuntimeError): HttpError {
  if (!(caughtError instanceof HttpError)) {
    return convertToHttpError(caughtError);
  }

  return caughtError;
}
