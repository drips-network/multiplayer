import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import type { GetVotingRoundResultRequest } from './GetVotingRoundResultRequest';
import ApiServer from '../../ApiServer';
import { getVotingRoundResultRequestValidators } from './getVotingRoundResultRequestValidators';
import type GetVotingRoundResultUseCase from './GetVotingRoundResultUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundsResponse } from '../getVotingRounds/GetVotingRoundsResponse';

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
    req: TypedRequestParams<GetVotingRoundResultRequest>,
    res: TypedResponse<GetVotingRoundsResponse>,
  ): Promise<Response> {
    const votingRoundResult = await this._getVotingRoundResultUseCase.execute(
      req.params,
    );

    return res.status(200).send(votingRoundResult);
  }
}
