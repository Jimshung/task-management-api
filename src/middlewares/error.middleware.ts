import { Middleware } from '@loopback/rest';

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    return await next();
  } catch (err) {
    console.error('Request error:', {
      url: ctx.request.url,
      method: ctx.request.method,
      error: err,
    });
    throw err;
  }
};
