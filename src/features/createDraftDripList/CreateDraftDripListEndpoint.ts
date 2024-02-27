import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type CreateDraftDripListUseCase from './CreateDraftDripListUseCase';
import type TypedRequestBody from '../../application/interfaces/ITypedRequestBody';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';

export default class CreateDraftDripListEndpoint implements IEndpoint {
  private readonly _createDraftDripListUseCase: CreateDraftDripListUseCase;

  public constructor(createDraftDripListUseCase: CreateDraftDripListUseCase) {
    this._createDraftDripListUseCase = createDraftDripListUseCase;
  }

  public async handle(
    req: TypedRequestBody<CreateDraftDripListRequest>,
    res: TypedResponse<CreateDraftDripListResponse>,
  ) {
    const createResult = await this._createDraftDripListUseCase.execute(
      req.body,
    );

    return res
      .status(201)
      .location(`/drafts/${createResult.draftDripListId}`)
      .json(createResult);
  }
}
