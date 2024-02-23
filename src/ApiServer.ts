import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type StartVotingRoundEndpoint from './features/votingRound/startVotingRound/StartVotingRound.Endpoint';
import { startVotingRoundRequestRequestValidators } from './features/votingRound/startVotingRound/startVotingRoundRequestRequestValidators';
import type { IEndpoint } from './application/interfaces/IEndpoint';
import appSettings from './appSettings';
import logger from './infrastructure/logger';
import NotFoundError from './application/ NotFoundError';
import type CreateDraftDripListEndpoint from './features/draftDripList/create/CreateDraftDripList.Endpoint';
import { createDraftDripListRequestRequestValidators } from './features/draftDripList/create/createDraftDripListRequestValidators';
import { getDraftDripListByIdRequestValidators } from './features/draftDripList/getById/getDripListByIdRequestValidators';
import type GetDraftDripListByIdEndpoint from './features/draftDripList/getById/GetDraftDripListById.Endpoint';

export default class ApiServer {
  public static async run(
    startVotingRoundEndpoint: StartVotingRoundEndpoint,
    createDraftDripListEndpoint: CreateDraftDripListEndpoint,
    getDraftDripListByIdEndpoint: GetDraftDripListByIdEndpoint,
    port: number = appSettings.apiPort,
  ): Promise<void> {
    const app = express();

    app.use(express.json());

    app.post(
      '/start-voting-round',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(startVotingRoundEndpoint),
    );

    app.get(
      '/drafts/:id',
      ...getDraftDripListByIdRequestValidators,
      ApiServer.useEndpoint(getDraftDripListByIdEndpoint),
    );

    app.post(
      '/drafts',
      ...createDraftDripListRequestRequestValidators,
      ApiServer.useEndpoint(createDraftDripListEndpoint),
    );

    app.listen(port, () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
    });
  }

  private static useEndpoint(endpoint: IEndpoint) {
    return async (req: Request, res: Response) => {
      // 400 Bad Request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        return await endpoint.handle(req, res);
      } catch (error) {
        if (error instanceof NotFoundError) {
          // 404 Not Found
          return res.status(404).json({ error: error.message });
        }
        logger.error(error);

        // 500 Internal Server Error
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }
    };
  }
}
