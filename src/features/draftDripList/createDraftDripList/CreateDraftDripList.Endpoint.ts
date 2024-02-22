import type { Request, Response } from 'express';
import type { UUID } from 'typeorm/driver/mongodb/bson.typings';
import type { IEndpoint } from '../../../application/interfaces/IEndpoint';
import type CreateDraftDripListUseCase from './CreateDraftDripList.UseCase';
import type CreateDraftDripListRequest from './CreateDraftDripList.Request';

export default class CreateDraftDripListEndpoint implements IEndpoint {
  private readonly _createDraftDripListUseCase: CreateDraftDripListUseCase;

  public constructor(createDraftDripListUseCase: CreateDraftDripListUseCase) {
    this._createDraftDripListUseCase = createDraftDripListUseCase;
  }

  public async handle(
    req: Request<any, any, CreateDraftDripListRequest>,
    res: Response<{
      draftDripListId: UUID;
    }>,
  ): Promise<
    Response<{
      draftDripListId: UUID;
    }>
  > {
    const draftDripListId = (await this._createDraftDripListUseCase.execute(
      req.body,
    )) as unknown as UUID; // Known to be a UUID.

    return res
      .status(201)
      .location(`/drafts/${draftDripListId}`)
      .json({ draftDripListId });
  }
}
