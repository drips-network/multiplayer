import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { PublishRequest } from './PublishRequest';
import ApiServer from '../../ApiServer';
import { publishRequestValidators } from './publishRequestValidators';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';
import type PublishUseCase from './PublishUseCase';

export default class PublishEndpoint implements IEndpoint {
  private readonly _publishUseCase: PublishUseCase;

  public constructor(publishUseCase: PublishUseCase) {
    this._publishUseCase = publishUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:id/publish',
      ...publishRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      PublishRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._publishUseCase.execute({
      votingRoundId: req.params.votingRoundId,
      publisherAddress: req.body.publisherAddress,
      dripListId: req.body.dripListId,
    });

    return res.status(200).send();
  }
}
