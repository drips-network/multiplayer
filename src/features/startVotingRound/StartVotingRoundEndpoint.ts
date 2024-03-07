import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import { startVotingRoundRequestRequestValidators } from './startVotingRoundRequestRequestValidators';
import ApiServer from '../../ApiServer';
import type StartVotingRoundUseCase from './StartVotingRoundUseCase';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type TypedRequestBody from '../../application/interfaces/ITypedRequestBody';

export default class StartVotingRoundEndpoint implements IEndpoint {
  private readonly _startVotingRoundUseCase: StartVotingRoundUseCase;

  public constructor(startVotingRoundUseCase: StartVotingRoundUseCase) {
    this._startVotingRoundUseCase = startVotingRoundUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds',
      ...startVotingRoundRequestRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestBody<StartVotingRoundRequest>,
    res: TypedResponse<StartVotingRoundResponse>,
  ): Promise<Response> {
    const startVotingRoundResult = await this._startVotingRoundUseCase.execute(
      req.body,
    );

    return res
      .status(201)
      .location(`/votingRounds/${startVotingRoundResult.newVotingRoundId}`)
      .json(startVotingRoundResult);
  }
}
