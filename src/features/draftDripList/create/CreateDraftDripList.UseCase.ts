import type { Repository } from 'typeorm';
import type UseCase from '../../../application/interfaces/IUseCase';
import { DraftDripList } from '../../../domain/DraftDripList';
import type { CreateDraftDripListResponse } from './CreateDraftDripList.Response';
import type { CreateDraftDripListRequest } from './CreateDraftDripList.Request';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, CreateDraftDripListResponse>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(
    request: CreateDraftDripListRequest,
  ): Promise<CreateDraftDripListResponse> {
    const { name, description } = request;

    const draftDripList = new DraftDripList(name, description);

    await this._repository.save(draftDripList);

    return {
      draftDripListId: draftDripList.id,
    };
  }
}
