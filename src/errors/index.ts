export class BaseError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ValidationError extends BaseError {
  constructor(message = 'Validation failed') {
    super(400, message);
  }
}
