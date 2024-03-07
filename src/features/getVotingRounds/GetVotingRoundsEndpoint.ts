import type { Application } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import ApiServer from '../../ApiServer';
import { getVotingRoundsRequestValidators } from './getVotingRoundsRequestValidators';
import type GetVotingRoundsUseCase from './GetVotingRoundsUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { TypedRequestQuery } from '../../application/interfaces/ITypedRequestQuery';

export default class GetVotingRoundsEndpoint implements IEndpoint {
  private readonly _getVotingRoundsUseCase: GetVotingRoundsUseCase;

  public constructor(getVotingRoundsUseCase: GetVotingRoundsUseCase) {
    this._getVotingRoundsUseCase = getVotingRoundsUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds',
      ...getVotingRoundsRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestQuery<GetVotingRoundsRequest>,
    res: TypedResponse<GetVotingRoundsResponse>,
  ) {
    const votingRound = await this._getVotingRoundsUseCase.execute(req.query);

    return res.status(200).send(votingRound);
  }
}
