import type { Request } from 'express';

export default interface TypedRequestBody<T> extends Request {
  body: T;
}
