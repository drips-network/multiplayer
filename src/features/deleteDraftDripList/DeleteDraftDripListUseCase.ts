import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { DeleteDraftDripListRequest } from './DeleteDraftDripListRequest';
import type DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';

export default class DeleteDraftDripListUseCase
  implements UseCase<DeleteDraftDripListRequest>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(request: DeleteDraftDripListRequest): Promise<void> {
    const dripListIdToDelete = await this._repository.findOneOrFail({
      where: { id: request.draftDripListId },
    });

    await this._repository.softDelete({
      id: dripListIdToDelete.id,
    });
  }
}
