import type { IEndpoint } from '../../../application/interfaces/IEndpoint';
import type GetDraftDripListByIdUseCase from './GetDraftDripListById.UseCase';
import type { TypedResponse } from '../../../application/interfaces/ITypedResponse';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListById.Request';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListById.Response';
import type { TypedRequestParams } from '../../../application/interfaces/ITypedRequestParams';

export default class GetDraftDripListByIdEndpoint implements IEndpoint {
  private readonly _getDraftDripListByIdUseCase: GetDraftDripListByIdUseCase;

  public constructor(getDraftDripListByIdUseCase: GetDraftDripListByIdUseCase) {
    this._getDraftDripListByIdUseCase = getDraftDripListByIdUseCase;
  }

  public async handle(
    req: TypedRequestParams<GetDraftDripListByIdRequest>,
    res: TypedResponse<GetDraftDripListByIdResponse>,
  ) {
    const draftDripList = await this._getDraftDripListByIdUseCase.execute(
      req.params,
    );

    return res.status(200).json(draftDripList);
  }
}
