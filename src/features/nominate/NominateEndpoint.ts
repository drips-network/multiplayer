import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type NominateUseCase from './NominateUseCase';
import type { NominateRequest } from './NominateRequest';
import { nominateRequestValidators } from './nominateRequestValidators';
import ApiServer from '../../ApiServer';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class NominateEndpoint implements IEndpoint {
  private readonly _nominateUseCase: NominateUseCase;

  public constructor(nominateUseCase: NominateUseCase) {
    this._nominateUseCase = nominateUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:votingRoundId/nominations',
      ...nominateRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      NominateRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._nominateUseCase.execute({
      ...req.body,
      votingRoundId: req.params.votingRoundId,
    });

    return res.status(201).send();
  }
}
