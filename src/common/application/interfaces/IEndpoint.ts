import type { Request, Response } from 'express';

export interface IEndpoint {
  handle(req: Request, res: Response): Promise<Response>;
}
