import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import ApiServer from '../../ApiServer';
import type SoftDeleteVotingRoundUseCase from './SoftDeleteVotingVotingRoundUseCase';
import type { SoftDeleteVotingRoundRequest } from './SoftDeleteVotingVotingRoundRequest';
import { softDeleteVotingRoundRequestValidators } from './softDeleteVotingRoundRequestValidators';

export default class SoftDeleteVotingRoundEndpoint implements IEndpoint {
  private readonly _startVotingRoundUseCase: SoftDeleteVotingRoundUseCase;

  public constructor(startVotingRoundUseCase: SoftDeleteVotingRoundUseCase) {
    this._startVotingRoundUseCase = startVotingRoundUseCase;
  }

  configure(app: Application): void {
    app.delete(
      '/votingRounds/:id',
      ...softDeleteVotingRoundRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<SoftDeleteVotingRoundRequest>,
    res: Response,
  ): Promise<Response> {
    await this._startVotingRoundUseCase.execute(req.params);

    return res.status(204).send();
  }
}
