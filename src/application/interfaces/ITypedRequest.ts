import type { Request } from 'express';
import type { Query, ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequest<
  TParams extends ParamsDictionary = ParamsDictionary,
  TQuery extends Query = Query,
  TBody = any,
> extends Request {
  params: TParams;
  body: TBody;
  query: TQuery;
}
