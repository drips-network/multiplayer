import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';
import { assertIsEthAddress } from '../../domain/typeUtils';
import { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import Publisher from '../../domain/draftDripListAggregate/Publisher';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, CreateDraftDripListResponse>
{
  private readonly _draftDripListsRepository: Repository<DraftDripList>;
  private readonly _publishersRepository: Repository<Publisher>;

  public constructor(
    draftDripListsRepository: Repository<DraftDripList>,
    publishersRepository: Repository<Publisher>,
  ) {
    this._draftDripListsRepository = draftDripListsRepository;
    this._publishersRepository = publishersRepository;
  }

  public async execute(
    request: CreateDraftDripListRequest,
  ): Promise<CreateDraftDripListResponse> {
    const { publisherAddressId, publisherAddress, name, description } = request;

    assertIsEthAddress(publisherAddress);

    let publisher = await this._publishersRepository.findOne({
      where: { _address: publisherAddress },
    });

    if (!publisher) {
      publisher = Publisher.new(publisherAddressId, publisherAddress);
    }

    const draftDripList = DraftDripList.new(name, description, publisher);

    await this._draftDripListsRepository.save(draftDripList);

    return {
      draftDripListId: draftDripList.id,
    };
  }
}
