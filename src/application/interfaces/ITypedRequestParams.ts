import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface TypedRequestParams<T extends ParamsDictionary>
  extends Request {
  params: T;
}
