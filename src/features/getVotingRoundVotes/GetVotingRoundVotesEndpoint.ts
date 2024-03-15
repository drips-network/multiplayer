import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import type { GetVotingRoundVotesRequest } from './GetVotingRoundVotesRequest';
import ApiServer from '../../ApiServer';
import { getVotesRequestValidators } from './getVotingRoundVotesRequestValidators';
import type GetVotesUseCase from './GetVotingRoundVotesUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundVotesResponse } from './GetVotingRoundVotesResponse';

export default class GetVotingRoundVotesEndpoint implements IEndpoint {
  private readonly _getVotesUseCase: GetVotesUseCase;

  public constructor(getVotesUseCase: GetVotesUseCase) {
    this._getVotesUseCase = getVotesUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds/:votingRoundId/votes',
      ...getVotesRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<GetVotingRoundVotesRequest>,
    res: TypedResponse<GetVotingRoundVotesResponse>,
  ): Promise<Response> {
    const votingRoundVotes = await this._getVotesUseCase.execute(req.params);

    return res.status(200).send(votingRoundVotes);
  }
}
