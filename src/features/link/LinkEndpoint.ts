import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type LinkUseCase from './LinkUseCase';
import type { LinkRequest } from './LinkRequest';
import { linkRequestValidators } from './linkRequestValidators';
import ApiServer from '../../ApiServer';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class LinkEndpoint implements IEndpoint {
  private readonly _linkUseCase: LinkUseCase;

  public constructor(linkUseCase: LinkUseCase) {
    this._linkUseCase = linkUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:votingRoundId/link',
      ...linkRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      LinkRequest
    >,
    res: Response,
  ): Promise<Response> {
    await this._linkUseCase.execute({
      votingRoundId: req.params.votingRoundId,
      publisherAddress: req.body.publisherAddress,
    });

    return res.status(200).send();
  }
}
