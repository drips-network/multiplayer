import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type StartVotingRoundEndpoint from '../features/startVotingRound/StartVotingRound.Endpoint';
import { startVotingRoundRequestRequestValidators } from '../features/startVotingRound/startVotingRoundRequestRequestValidators';
import type { IEndpoint } from '../common/application/interfaces/IEndpoint';
import appSettings from '../appSettings';
import logger from '../infrastructure/logger';

export default class ApiServer {
  public static async run(
    createDraftDripListEndpoint: StartVotingRoundEndpoint,
    port: number = appSettings.apiPort,
  ): Promise<void> {
    const app = express();

    app.use(express.json());

    app.post(
      '/start-voting-round',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(createDraftDripListEndpoint),
    );

    app.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
    });
  }

  private static useEndpoint(endpoint: IEndpoint) {
    return (req: Request, res: Response) => {
      const result = validationResult(req);
      if (result.isEmpty()) {
        return endpoint.handle(req as Request, res);
      }

      return res.send({ errors: result.array() });
    };
  }
}
