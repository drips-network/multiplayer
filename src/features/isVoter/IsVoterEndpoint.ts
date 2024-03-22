import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import ApiServer from '../../ApiServer';
import { isVoterRequestValidators } from './isVoterRequestValidators';
import type IsVoterUseCase from './IsVoterUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundsResponse } from '../getVotingRounds/GetVotingRoundsResponse';
import { assertIsAddress } from '../../domain/typeUtils';

export default class IsVoterEndpoint implements IEndpoint {
  private readonly _isVoterUseCase: IsVoterUseCase;

  public constructor(isVoterUseCase: IsVoterUseCase) {
    this._isVoterUseCase = isVoterUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds/:votingRoundId/collaborators/:collaboratorAddress/isVoter',
      ...isVoterRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<{
      votingRoundId: UUID;
      collaboratorAddress: string;
    }>,
    res: TypedResponse<GetVotingRoundsResponse>,
  ): Promise<Response> {
    assertIsAddress(req.params.collaboratorAddress);

    const isVoter = await this._isVoterUseCase.execute({
      votingRoundId: req.params.votingRoundId,
      collaboratorAddress: req.params.collaboratorAddress,
    });

    return res.status(200).send(isVoter);
  }
}
