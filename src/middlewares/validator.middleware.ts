import { Middleware } from '@loopback/rest';
import { ApiError, ErrorCodes } from '../errors/api-error';

export const validateTodoCreate: Middleware = async (ctx, next) => {
  const { request } = ctx;
  const body = request.body;

  if (!body.todo || !body.todo.title) {
    throw new ApiError(400, '標題為必填項', ErrorCodes.VALIDATION_ERROR);
  }

  if (body.items) {
    if (!Array.isArray(body.items)) {
      throw new ApiError(400, 'items 必須是陣列', ErrorCodes.VALIDATION_ERROR);
    }

    body.items.forEach((item: any) => {
      if (!item.content) {
        throw new ApiError(
          400,
          '項目內容為必填項',
          ErrorCodes.VALIDATION_ERROR,
        );
      }
    });
  }

  return next();
};

export const validateItemCompletion: Middleware = async (ctx, next) => {
  const { request } = ctx;
  const body = request.body;

  if (typeof body.isCompleted !== 'boolean') {
    throw new ApiError(
      400,
      'isCompleted 必須是布林值',
      ErrorCodes.VALIDATION_ERROR,
    );
  }

  return next();
};

export const validateBulkCompletion: Middleware = async (ctx, next) => {
  const { request } = ctx;
  const body = request.body;

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    throw new ApiError(400, 'ids 必須是非空數組', ErrorCodes.VALIDATION_ERROR);
  }

  if (typeof body.isCompleted !== 'boolean') {
    throw new ApiError(
      400,
      'isCompleted 必須是布林值',
      ErrorCodes.VALIDATION_ERROR,
    );
  }

  return next();
};
