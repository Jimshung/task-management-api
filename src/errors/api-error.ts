import { HttpErrors } from '@loopback/rest';

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class ApiError extends HttpErrors.HttpError {
  public readonly code: ErrorCodes;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: ErrorCodes,
    details?: unknown,
  ) {
    super(statusCode.toString());
    this.message = message;
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;

    // 設置自定義錯誤名稱
    this.name = 'ApiError';

    // 確保錯誤對象可以被正確序列化
    Object.defineProperty(this, 'code', { enumerable: true });
    Object.defineProperty(this, 'details', { enumerable: true });
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
      details: this.details,
    };
  }
}
