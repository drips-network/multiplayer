import type { Application, Request, Response } from 'express';

export interface IEndpoint {
  handle(req: Request, res: Response): Promise<Response>;
  configure(app: Application): void;
}
