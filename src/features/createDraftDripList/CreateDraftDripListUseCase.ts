import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';

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
    const { publisherAddressId, publisherAddress, name, description } = request;

    const draftDripList = DraftDripList.new(
      name,
      description,
      publisherAddressId,
      publisherAddress,
    );

    await this._repository.save(draftDripList);

    return {
      draftDripListId: draftDripList.id,
    };
  }
}
