import type { Repository } from 'typeorm';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';
import { assertIsEthAddress } from '../../domain/typeUtils';
import DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';
import Publisher from '../../domain/draftDripListAggregate/Publisher';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, CreateDraftDripListResponse>
{
  private readonly _logger: Logger;
  private readonly _publishersRepository: Repository<Publisher>;
  private readonly _draftDripListsRepository: Repository<DraftDripList>;

  public constructor(
    logger: Logger,
    publishersRepository: Repository<Publisher>,
    draftDripListsRepository: Repository<DraftDripList>,
  ) {
    this._logger = logger;
    this._publishersRepository = publishersRepository;
    this._draftDripListsRepository = draftDripListsRepository;
  }

  public async execute(
    request: CreateDraftDripListRequest,
  ): Promise<CreateDraftDripListResponse> {
    const { publisherAddressId, publisherAddress, name, description } = request;

    this._logger.info(
      `Creating a new draft drip list with name '${name}', description '${description}', publisher address '${publisherAddress}', and publisher address ID '${publisherAddressId}'...`,
    );

    assertIsEthAddress(publisherAddress);

    let publisher = await this._publishersRepository.findOne({
      where: { _address: publisherAddress },
    });

    if (!publisher) {
      publisher = Publisher.new(publisherAddressId, publisherAddress);
    }

    const draftDripList = DraftDripList.new(name, description, publisher);

    await this._draftDripListsRepository.save(draftDripList);

    this._logger.info(
      `Created successfully a new draft drip list with ID '${draftDripList.id}'.`,
    );

    return {
      draftDripListId: draftDripList.id,
    };
  }
}
