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
      '/drafts/:draftDripListId/startVotingRound',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<{
      draftDripListId: UUID;
    }>,
    res: TypedResponse<StartVotingRoundResponse>,
  ): Promise<Response<StartVotingRoundResponse>> {
    const startVotingRoundResult = await this._startVotingRoundUseCase.execute({
      draftDripListId: req.params.draftDripListId,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
    });

    return res.status(201).json(startVotingRoundResult);
  }
}
