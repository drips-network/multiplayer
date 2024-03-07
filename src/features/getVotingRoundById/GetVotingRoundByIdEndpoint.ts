import type { Application, Response } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import ApiServer from '../../ApiServer';
import { getVotingRoundByIdRequestValidators } from './getVotingRoundByIdRequestValidators';
import type GetVotingRoundByIdUseCase from './GetVotingRoundByIdUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetVotingRoundsResponse } from '../getVotingRounds/GetVotingRoundsResponse';

export default class GetVotingRoundByIdEndpoint implements IEndpoint {
  private readonly _getVotingRoundByIdUseCase: GetVotingRoundByIdUseCase;

  public constructor(getVotingRoundByIdUseCase: GetVotingRoundByIdUseCase) {
    this._getVotingRoundByIdUseCase = getVotingRoundByIdUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/votingRounds/:id',
      ...getVotingRoundByIdRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<GetVotingRoundByIdRequest>,
    res: TypedResponse<GetVotingRoundsResponse>,
  ): Promise<Response> {
    const votingRound = await this._getVotingRoundByIdUseCase.execute(
      req.params,
    );

    return res.status(200).send(votingRound);
  }
}
