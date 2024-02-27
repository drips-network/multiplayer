import type { Request, Response } from 'express';
import express from 'express';
import { validationResult } from 'express-validator';
import type { IEndpoint } from './application/interfaces/IEndpoint';
import appSettings from './appSettings';
import logger from './infrastructure/logger';
import NotFoundError from './application/ NotFoundError';
import type CreateDraftDripListEndpoint from './features/createDraftDripList/CreateDraftDripListEndpoint';
import { createDraftDripListRequestRequestValidators } from './features/createDraftDripList/createDraftDripListRequestValidators';
import { deleteDraftDripListRequestRequestValidators } from './features/deleteDraftDripList/deleteDraftDripListRequestValidators';
import type DeleteDraftDripListEndpoint from './features/deleteDraftDripList/DeleteDraftDripListEndpoint';
import type GetDraftDripListByIdEndpoint from './features/getDraftDripListById/GetDraftDripListByIdEndpoint';
import { getDraftDripListByIdRequestValidators } from './features/getDraftDripListById/getDraftDripListByIdRequestValidators';

export default class ApiServer {
  public static async run(
    createDraftDripListEndpoint: CreateDraftDripListEndpoint,
    getDraftDripListByIdEndpoint: GetDraftDripListByIdEndpoint,
    deleteDraftDripListEndpoint: DeleteDraftDripListEndpoint,
    port: number = appSettings.apiPort,
  ): Promise<void> {
    const app = express();

    app.use(express.json());

    app.post(
      '/drafts',
      ...createDraftDripListRequestRequestValidators,
      ApiServer.useEndpoint(createDraftDripListEndpoint),
    );

    app.get(
      '/drafts/:draftDripListId',
      ...getDraftDripListByIdRequestValidators,
      ApiServer.useEndpoint(getDraftDripListByIdEndpoint),
    );

    app.delete(
      '/drafts/:draftDripListId',
      ...deleteDraftDripListRequestRequestValidators,
      ApiServer.useEndpoint(deleteDraftDripListEndpoint),
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
        if (error instanceof NotFoundError) {
          // 404 Not Found
          return res.status(404).json({ error: error.message });
        }
        logger.error(`${error.message}\n${error.stack}`);

        // 500 Internal Server Error
        return res.status(500).json({ error: 'An unexpected error occurred.' });
      }
    };
  }
}
