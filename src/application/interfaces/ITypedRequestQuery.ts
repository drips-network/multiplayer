import type { Request } from 'express';
import type { Query } from 'express-serve-static-core';

export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}
