import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';

export type Headers = APIGatewayProxyResult['headers'];

const defaultHeaders: Headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': false,
  'Content-Type': 'application/json',
};

export class Response {
  public headers: Headers | undefined;

  constructor(headers: Headers | null = defaultHeaders) {
    this.setHeaders(headers);
  }

  setHeaders(headers: Headers | null) {
    this.headers = headers === null ? undefined : headers;
  }

  create(httpStatus: number, body?: any, headers?: Headers): APIGatewayProxyResult {
    return {
      statusCode: httpStatus,
      headers: {
        ...this.headers,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : '',
    };
  }

  error(httpStatus: number, message: string, details?: Record<string, any>, headers?: Headers): APIGatewayProxyResult {
    const body = {
      status: httpStatus,
      message,
      details,
    };

    return this.create(httpStatus, body, headers);
  }
}

export const defaultResponse = new Response();

export function createResponse(httpStatus: number, body?: any, headers?: Headers): APIGatewayProxyResult {
  return defaultResponse.create(httpStatus, body, headers);
}

export function errorResponse(
  httpStatus: number,
  message: string,
  details?: Record<string, any>,
  headers?: Headers
): APIGatewayProxyResult {
  return defaultResponse.error(httpStatus, message, details, headers);
}
