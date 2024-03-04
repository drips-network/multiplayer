import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';
import { assertIsEthAddress } from '../../domain/typeUtils';
import DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';
import Publisher from '../../domain/draftDripListAggregate/Publisher';
import type IDraftDripListRepository from '../../domain/draftDripListAggregate/IDraftDripListRepository';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, CreateDraftDripListResponse>
{
  private readonly _logger: Logger;
  private readonly _repository: IDraftDripListRepository;

  public constructor(logger: Logger, repository: IDraftDripListRepository) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    request: CreateDraftDripListRequest,
  ): Promise<CreateDraftDripListResponse> {
    const { publisherAddressId, publisherAddress, name, description } = request;

    this._logger.info(
      `Creating a new draft drip list with name '${name}', description '${description}', publisher address '${publisherAddress}', and publisher address ID '${publisherAddressId}'...`,
    );

    assertIsEthAddress(publisherAddress);

    const draftDripList = DraftDripList.create(
      name,
      description,
      Publisher.create(publisherAddressId, publisherAddress),
    );

    await this._repository.save(draftDripList);

    this._logger.info(
      `Created successfully a new draft drip list with ID '${draftDripList._id}'.`,
    );

    return {
      draftDripListId: draftDripList._id,
    };
  }
}
