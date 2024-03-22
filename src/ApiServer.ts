import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { IEndpoint } from './application/interfaces/IEndpoint';
import appSettings from './appSettings';
import logger from './infrastructure/logger';
import { NotFoundError, UnauthorizedError } from './application/errors';
import {
  InvalidArgumentError,
  InvalidVotingRoundOperationError,
} from './domain/errors';

export default class ApiServer {
  public static async run(
    endpoints: IEndpoint[],
    port: number = appSettings.port,
  ): Promise<void> {
    const app = express();

    app.use(express.json());

    ApiServer.mapEndpoints(app, endpoints);

    app.listen(port, () => {
      logger.info(`🚀 Server running on 'http://localhost:${port}'.`);
    });
  }

  private static mapEndpoints(
    app: express.Application,
    endpoints: IEndpoint[],
  ) {
    endpoints.forEach((endpoint) => endpoint.configure(app));
  }

  public static useEndpoint(endpoint: IEndpoint) {
    return async (req: Request, res: Response) => {
      // 400 Bad Request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        return await endpoint.handle(req, res);
      } catch (error: any) {
        // 400 Bad Request
        if (
          error instanceof InvalidArgumentError ||
          error instanceof InvalidVotingRoundOperationError
        ) {
          logger.info(`${error.message}`);
          return res.status(400).json({ error: error.message });
        }

        // 404 Not Found
        if (error instanceof NotFoundError) {
          logger.info(`${error.message}`);
          return res.status(404).json({ error: error.message });
        }

        // 401 Unauthorized
        if (error instanceof UnauthorizedError) {
          logger.info(`${error.message}`);
          return res.status(401).json({ error: error.message });
        }

        logger.error(`${error.message}\n${error.stack}`);

        // 500 Internal Server Error
        return res.status(500).json({ error: error.message });
      }
    };
  }
}
