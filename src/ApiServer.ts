import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { IEndpoint } from './application/interfaces/IEndpoint';
import appSettings from './appSettings';
import logger from './infrastructure/logger';
import type CreateDraftDripListEndpoint from './features/createDraftDripList/CreateDraftDripListEndpoint';
import { createDraftDripListRequestValidators } from './features/createDraftDripList/createDraftDripListRequestValidators';
import type DeleteDraftDripListEndpoint from './features/deleteDraftDripList/DeleteDraftDripListEndpoint';
import type GetDraftDripListByIdEndpoint from './features/getDraftDripListById/GetDraftDripListByIdEndpoint';
import { getDraftDripListByIdRequestValidators } from './features/getDraftDripListById/getDraftDripListByIdRequestValidators';
import { startVotingRoundRequestRequestValidators } from './features/startVotingRound/startVotingRoundRequestRequestValidators';
import { NotFoundError } from './application/errors';
import type StartVotingRoundEndpoint from './features/startVotingRound/StartVotingRoundEndpoint';
import { InvalidVotingRoundOperationError } from './domain/errors';
import { deleteDraftDripListRequestValidators } from './features/deleteDraftDripList/deleteDraftDripListRequestValidators';

export default class ApiServer {
  public static async run(
    createDraftDripListEndpoint: CreateDraftDripListEndpoint,
    getDraftDripListByIdEndpoint: GetDraftDripListByIdEndpoint,
    deleteDraftDripListEndpoint: DeleteDraftDripListEndpoint,
    startVotingRoundEndpoint: StartVotingRoundEndpoint,
    port: number = appSettings.apiPort,
  ): Promise<void> {
    const app = express();

    app.use(express.json());

    app.post(
      '/drafts',
      ...createDraftDripListRequestValidators,
      ApiServer.useEndpoint(createDraftDripListEndpoint),
    );

    app.get(
      '/drafts/:draftDripListId',
      ...getDraftDripListByIdRequestValidators,
      ApiServer.useEndpoint(getDraftDripListByIdEndpoint),
    );

    app.delete(
      '/drafts/:draftDripListId',
      ...deleteDraftDripListRequestValidators,
      ApiServer.useEndpoint(deleteDraftDripListEndpoint),
    );

    app.post(
      '/drafts/:draftDripListId/startVotingRound',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(startVotingRoundEndpoint),
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
      } catch (error: any) {
        // 400 Bad Request
        if (error instanceof InvalidVotingRoundOperationError) {
          return res.status(400).json({ error: error.message });
        }

        // 404 Not Found
        if (error instanceof NotFoundError) {
          return res.status(404).json({ error: error.message });
        }

        logger.error(`${error.message}\n${error.stack}`);

        // 500 Internal Server Error
        return res.status(500).json({ error: error.message });
      }
    };
  }
}
