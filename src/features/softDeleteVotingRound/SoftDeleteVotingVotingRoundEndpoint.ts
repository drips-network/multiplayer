import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import ApiServer from '../../ApiServer';
import type SoftDeleteVotingRoundUseCase from './SoftDeleteVotingVotingRoundUseCase';
import type { SoftDeleteVotingRoundRequest } from './SoftDeleteVotingVotingRoundRequest';
import { softDeleteVotingRoundRequestValidators } from './softDeleteVotingRoundRequestValidators';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class SoftDeleteVotingRoundEndpoint implements IEndpoint {
  private readonly _softDeleteVotingRoundUseCase: SoftDeleteVotingRoundUseCase;

  public constructor(
    softDeleteVotingRoundUseCase: SoftDeleteVotingRoundUseCase,
  ) {
    this._softDeleteVotingRoundUseCase = softDeleteVotingRoundUseCase;
  }

  configure(app: Application): void {
    app.delete(
      '/votingRounds/:id',
      ...softDeleteVotingRoundRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        id: UUID;
      },
      any,
      SoftDeleteVotingRoundRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._softDeleteVotingRoundUseCase.execute({
      ...req.body,
      id: req.params.id,
    });

    return res.status(204).send();
  }
}
