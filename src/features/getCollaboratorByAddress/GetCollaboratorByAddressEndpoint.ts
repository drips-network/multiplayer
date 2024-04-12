import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import ApiServer from '../../ApiServer';
import type GetCollaboratorByAddressUseCase from './GetCollaboratorByAddressUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import { assertIsAddress } from '../../domain/typeUtils';
import type { GetCollaboratorByAddressResponse } from './GetCollaboratorByAddressResponse';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';
import type { GetCollaboratorByAddressRequest } from './GetCollaboratorByAddressRequest';
import { getCollaboratorByAddressRequestValidators } from './GetCollaboratorByAddressRequestValidators';

export default class GetCollaboratorByAddressEndpoint implements IEndpoint {
  private readonly _getCollaboratorByAddressUseCase: GetCollaboratorByAddressUseCase;

  public constructor(
    getCollaboratorByAddressUseCase: GetCollaboratorByAddressUseCase,
  ) {
    this._getCollaboratorByAddressUseCase = getCollaboratorByAddressUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds/:votingRoundId/collaborators/:collaboratorAddress',
      ...getCollaboratorByAddressRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequest<
      {
        votingRoundId: UUID;
        collaboratorAddress: string;
      },
      GetCollaboratorByAddressRequest
    >,
    res: TypedResponse<GetCollaboratorByAddressResponse>,
  ): Promise<Response> {
    assertIsAddress(req.params.collaboratorAddress);

    const getCollaboratorByAddress =
      await this._getCollaboratorByAddressUseCase.execute({
        votingRoundId: req.params.votingRoundId,
        collaboratorAddress: req.params.collaboratorAddress,
        ...req.query,
      });

    return res.status(200).send(getCollaboratorByAddress);
  }
}
