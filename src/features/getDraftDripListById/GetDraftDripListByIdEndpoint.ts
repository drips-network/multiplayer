import type { Application } from 'express';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type GetDraftDripListByIdUseCase from './GetDraftDripListByIdUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListByIdRequest';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListByIdResponse';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';
import { getDraftDripListByIdRequestValidators } from './getDraftDripListByIdRequestValidators';
import ApiServer from '../../ApiServer';

export default class GetDraftDripListByIdEndpoint implements IEndpoint {
  private readonly _getDraftDripListByIdUseCase: GetDraftDripListByIdUseCase;

  public constructor(getDraftDripListByIdUseCase: GetDraftDripListByIdUseCase) {
    this._getDraftDripListByIdUseCase = getDraftDripListByIdUseCase;
  }

  configure(app: Application): void {
    app.get(
      '/drafts/:id',
      ...getDraftDripListByIdRequestValidators,
      ApiServer.useEndpoint(this),
    );
  }

  public async handle(
    req: TypedRequestParams<GetDraftDripListByIdRequest>,
    res: TypedResponse<GetDraftDripListByIdResponse>,
  ) {
    const votingRound = await this._getDraftDripListByIdUseCase.execute(
      req.params,
    );

    return res.status(200).json(votingRound);
  }
}
