import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type CastVoteUseCase from './CastVoteUseCase';
import type TypedRequestBody from '../../application/interfaces/ITypedRequestBody';
import type { CastVoteRequest } from './CastVoteRequest';
import { castVoteRequestValidators } from './castVoteRequestValidators';
import ApiServer from '../../ApiServer';

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

  public async handle(req: TypedRequestBody<CastVoteRequest>, res: Response) {
    await this._castVoteUseCase.execute(req.body);

    return res.status(201).send();
  }
}
