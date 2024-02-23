import type { Response } from 'express';
import type { Send } from 'express-serve-static-core';

export interface TypedResponse<ResBody> extends Response {
  json: Send<ResBody, this>;
}
