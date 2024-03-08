import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type CastVoteUseCase from './CastVoteUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import { castVoteRequestValidators } from './castVoteRequestValidators';
import ApiServer from '../../ApiServer';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class CastVoteEndpoint implements IEndpoint {
  private readonly _castVoteUseCase: CastVoteUseCase;

  public constructor(castVoteUseCase: CastVoteUseCase) {
    this._castVoteUseCase = castVoteUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:votingRoundId/votes',
      ...castVoteRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      CastVoteRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._castVoteUseCase.execute({
      votingRoundId: req.params.votingRoundId,
      collaboratorAddress: req.body.collaboratorAddress,
      receivers: req.body.receivers,
    });

    return res.status(201).send();
  }
}
