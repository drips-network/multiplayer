import type { Repository } from 'typeorm';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CreateDraftDripListResponse } from './CreateDraftDripListResponse';
import type { CreateDraftDripListRequest } from './CreateDraftDripListRequest';
import { assertIsEthAddress } from '../../domain/typeUtils';
import DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';

export default class CreateDraftDripListUseCase
  implements UseCase<CreateDraftDripListRequest, CreateDraftDripListResponse>
{
  private readonly _logger: Logger;
  private readonly __repository: Repository<DraftDripList>;

  public constructor(logger: Logger, _repository: Repository<DraftDripList>) {
    this._logger = logger;
    this.__repository = _repository;
  }

  public async execute(
    request: CreateDraftDripListRequest,
  ): Promise<CreateDraftDripListResponse> {
    const { publisherAddressId, publisherAddress, name, description } = request;

    this._logger.info(
      `Creating a new draft drip list with name '${name}', description '${description}', publisher address '${publisherAddress}', and publisher address ID '${publisherAddressId}'...`,
    );

    assertIsEthAddress(publisherAddress);

    const draftDripList = DraftDripList.new(
      name,
      description,
      publisherAddressId,
      publisherAddress,
    );

    await this.__repository.save(draftDripList);

    this._logger.info(
      `Created successfully a new draft drip list with ID '${draftDripList._id}'.`,
    );

    return {
      draftDripListId: draftDripList._id,
    };
  }
}
