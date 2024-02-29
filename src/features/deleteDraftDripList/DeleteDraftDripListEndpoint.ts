import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import type DeleteDraftDripListUseCase from './DeleteDraftDripListUseCase';
import type { DeleteDraftDripListRequest } from './DeleteDraftDripListRequest';
import ApiServer from '../../ApiServer';
import { deleteDraftDripListRequestValidators } from './deleteDraftDripListRequestValidators';

export default class DeleteDraftDripListEndpoint implements IEndpoint {
  private readonly _deleteDraftDripListUseCase: DeleteDraftDripListUseCase;

  public constructor(deleteDraftDripListUseCase: DeleteDraftDripListUseCase) {
    this._deleteDraftDripListUseCase = deleteDraftDripListUseCase;
  }

  configure(app: Application): void {
    app.delete(
      '/drafts/:id',
      ...deleteDraftDripListRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<DeleteDraftDripListRequest>,
    res: Response,
  ) {
    await this._deleteDraftDripListUseCase.execute(req.params);

    return res.status(204).send();
  }
}
