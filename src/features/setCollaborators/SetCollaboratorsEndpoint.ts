import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { SetCollaboratorsRequest } from './SetCollaboratorsRequest';
import { setCollaboratorsRequestValidators } from './setCollaboratorsRequestValidators';
import ApiServer from '../../ApiServer';
import type SetCollaboratorsUseCase from './SetCollaboratorsUseCase';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class SetCollaboratorsEndpoint implements IEndpoint {
  private readonly _setCollaboratorsUseCase: SetCollaboratorsUseCase;

  public constructor(setCollaboratorsUseCase: SetCollaboratorsUseCase) {
    this._setCollaboratorsUseCase = setCollaboratorsUseCase;
  }

  configure(app: Application): void {
    app.post(
      '/votingRounds/:votingRoundId/collaborators',
      ...setCollaboratorsRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
      },
      any,
      SetCollaboratorsRequest
    >,
    res: Response,
  ) {
    await this._setCollaboratorsUseCase.execute({
      votingRoundId: req.params.votingRoundId,
      collaborators: req.body.collaborators,
    });

    return res.status(200).send();
  }
}
