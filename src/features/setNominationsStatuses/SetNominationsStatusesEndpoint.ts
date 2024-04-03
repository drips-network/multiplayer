import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type SetNominationsStatusesUseCase from './SetNominationsStatusesUseCase';
import ApiServer from '../../ApiServer';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';
import { setNominationsStatusesRequestValidators } from './setNominationsStatusesRequestValidators';
import type { SetNominationsStatusesRequest } from './SetNominationsStatusesRequest';

export default class SetNominationsStatusesEndpoint implements IEndpoint {
  private readonly _setNominationsStatusesUseCase: SetNominationsStatusesUseCase;

  public constructor(
    setNominationsStatusesUseCase: SetNominationsStatusesUseCase,
  ) {
    this._setNominationsStatusesUseCase = setNominationsStatusesUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:votingRoundId/nominations/setStatus',
      ...setNominationsStatusesRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      SetNominationsStatusesRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._setNominationsStatusesUseCase.execute({
      ...req.body,
      votingRoundId: req.params.votingRoundId,
    });

    return res.status(200).send();
  }
}
