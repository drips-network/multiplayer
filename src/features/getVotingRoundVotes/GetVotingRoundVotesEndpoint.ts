import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import ApiServer from '../../ApiServer';
import { getVotesRequestValidators } from './getVotingRoundVotesRequestValidators';
import type GetVotingRoundVotesUseCase from './GetVotingRoundVotesUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundVotesResponse } from './GetVotingRoundVotesResponse';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';
import type { GetVotingRoundVotesRequest } from './GetVotingRoundVotesRequest';

export default class GetVotingRoundVotesEndpoint implements IEndpoint {
  private readonly _getVotesUseCase: GetVotingRoundVotesUseCase;

  public constructor(getVotesUseCase: GetVotingRoundVotesUseCase) {
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
    req: TypedRequest<
      {
        id: UUID;
      },
      {
        votingRoundId: UUID;
        signature: string | undefined;
        date: string | undefined;
      },
      GetVotingRoundVotesRequest
    >,
    res: TypedResponse<GetVotingRoundVotesResponse>,
  ): Promise<Response> {
    const votingRoundVotes = await this._getVotesUseCase.execute({
      ...req.query,
      ...req.params,
      ...req.body,
    });

    return res.status(200).send(votingRoundVotes);
  }
}
