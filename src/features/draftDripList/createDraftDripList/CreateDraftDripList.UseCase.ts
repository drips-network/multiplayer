import type { Repository } from 'typeorm';
import type { UUID } from 'crypto';
import type UseCase from '../../../application/interfaces/IUseCase';
import type CreateDraftDripListRequest from './CreateDraftDripList.Request';
import { DraftDripList } from '../../../domain/DraftDripList';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, UUID>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute({
    name,
    description,
  }: CreateDraftDripListRequest): Promise<UUID> {
    const draftDripList = new DraftDripList(name, description);

    await this._repository.save(draftDripList);

    return draftDripList.id;
  }
}
