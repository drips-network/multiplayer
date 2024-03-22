import type { Application, Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import ApiServer from '../../ApiServer';
import { getVotingRoundResultRequestValidators } from './getVotingRoundResultRequestValidators';
import type GetVotingRoundResultUseCase from './GetVotingRoundResultUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundsResponse } from '../getVotingRounds/GetVotingRoundsResponse';
import type { TypedRequest } from '../../application/interfaces/ITypedRequest';

export default class GetVotingRoundResultEndpoint implements IEndpoint {
  private readonly _getVotingRoundResultUseCase: GetVotingRoundResultUseCase;

  public constructor(getVotingRoundResultUseCase: GetVotingRoundResultUseCase) {
    this._getVotingRoundResultUseCase = getVotingRoundResultUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds/:votingRoundId/result',
      ...getVotingRoundResultRequestValidators,
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
      }
    >,
    res: TypedResponse<GetVotingRoundsResponse>,
  ): Promise<Response> {
    const votingRoundResult = await this._getVotingRoundResultUseCase.execute({
      ...req.params,
      ...req.query,
    });

    return res.status(200).send(votingRoundResult);
  }
}
