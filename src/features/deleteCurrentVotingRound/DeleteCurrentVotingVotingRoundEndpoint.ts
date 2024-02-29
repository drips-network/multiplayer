import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import ApiServer from '../../ApiServer';
import { deleteDraftDripListRequestValidators } from '../deleteDraftDripList/deleteDraftDripListRequestValidators';
import type DeleteCurrentVotingRoundUseCase from './DeleteCurrentVotingVotingRoundUseCase';
import type { DeleteCurrentVotingRoundRequest } from './DeleteCurrentVotingVotingRoundRequest';

export default class DeleteCurrentVotingRoundEndpoint implements IEndpoint {
  private readonly _startVotingRoundUseCase: DeleteCurrentVotingRoundUseCase;

  public constructor(startVotingRoundUseCase: DeleteCurrentVotingRoundUseCase) {
    this._startVotingRoundUseCase = startVotingRoundUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/drafts/:id/deleteVotingRound',
      ...deleteDraftDripListRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<DeleteCurrentVotingRoundRequest>,
    res: Response,
  ): Promise<Response> {
    await this._startVotingRoundUseCase.execute({
      id: req.params.id,
    });

    return res.status(204).send();
  }
}
