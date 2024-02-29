import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type StartVotingRoundUseCase from './StartVotingRoundUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import { startVotingRoundRequestRequestValidators } from './startVotingRoundRequestRequestValidators';
import ApiServer from '../../ApiServer';

export default class StartVotingRoundEndpoint implements IEndpoint {
  private readonly _startVotingRoundUseCase: StartVotingRoundUseCase;

  public constructor(startVotingRoundUseCase: StartVotingRoundUseCase) {
    this._startVotingRoundUseCase = startVotingRoundUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/drafts/:id/startVotingRound',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<{
      id: UUID;
    }>,
    res: TypedResponse<StartVotingRoundResponse>,
  ): Promise<Response<StartVotingRoundResponse>> {
    const startVotingRoundResult = await this._startVotingRoundUseCase.execute({
      id: req.params.id,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
    });

    return res.status(201).json(startVotingRoundResult);
  }
}
