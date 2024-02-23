import type { Request } from 'express';
import type { Query, ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequest<
  P extends ParamsDictionary = ParamsDictionary,
  T extends Query = Query,
  U = any,
> extends Request {
  params: P;
  body: U;
  query: T;
}
