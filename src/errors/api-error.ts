import { HttpErrors } from '@loopback/rest';

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class ApiError {
  public readonly statusCode: number;
  public readonly name: string;
  public readonly message: string;
  public readonly code: ErrorCodes;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: ErrorCodes,
    details?: unknown,
  ) {
    // 根據狀態碼建立對應的 HttpError
    let httpError;
    switch (statusCode) {
      case 400:
        httpError = new HttpErrors.BadRequest(message);
        break;
      case 404:
        httpError = new HttpErrors.NotFound(message);
        break;
      case 422:
        httpError = new HttpErrors.UnprocessableEntity(message);
        break;
      default:
        httpError = new HttpErrors.InternalServerError(message);
    }

    // 設置屬性
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.message = message;
    this.code = code;
    this.details = details;

    // 將 HttpError 的屬性合併到這個實例
    Object.assign(this, httpError);
  }

  public toJSON(): {
    statusCode: number;
    name: string;
    message: string;
    code: ErrorCodes;
    details?: unknown;
  } {
    return {
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
      code: this.code,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}
