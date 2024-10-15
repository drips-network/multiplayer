import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { IEndpoint } from './application/interfaces/IEndpoint';
import appSettings from './appSettings';
import logger from './infrastructure/logger';
import { NotFoundError, UnauthorizedError } from './application/errors';
import {
  InvalidArgumentError,
  InvalidLinkOperationError,
  InvalidVotingRoundOperationError,
} from './domain/errors';
import AppDataSource from './infrastructure/AppDataSource';

export default class ApiServer {
  public static async run(
    endpoints: IEndpoint[],
    port: number = appSettings.port,
  ): Promise<void> {
    const app = express();

    const authenticateApiKey = (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const apiKey = req.headers.authorization;
      if (apiKey && apiKey === `Bearer ${process.env.API_KEY}`) {
        next();
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    };

    app.route('/health').get(async (_, res) => {
      try {
        const checkDatabaseHealth = () => {
          if (!AppDataSource.isInitialized) {
            throw new Error('Database connection is not initialized.');
          }
        };

        const checkApiHealth = async () => {
          try {
            const response = await fetch(`${appSettings.graphQlUrl}/health`);
            if (response.status !== 200) {
              throw new Error(`API returned status ${response.status}`);
            }
          } catch (err) {
            throw new Error('Failed to reach API.');
          }
        };

        checkDatabaseHealth();
        await checkApiHealth();

        return res.status(200).send('OK');
      } catch (error: any) {
        logger.error(`Health check failed: ${error}`);

        return res.status(503).send('Service unavailable.');
      }
    });

    app.use(authenticateApiKey);

    app.use(express.json({ limit: '700kb' }));

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
          error instanceof InvalidVotingRoundOperationError ||
          error instanceof InvalidLinkOperationError
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
