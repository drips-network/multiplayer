import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import NotFoundError from '../../application/ NotFoundError';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListByIdResponse';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListByIdRequest';

export default class GetDraftDripListByIdUseCase
  implements UseCase<GetDraftDripListByIdRequest, GetDraftDripListByIdResponse>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(
    request: GetDraftDripListByIdRequest,
  ): Promise<GetDraftDripListByIdResponse> {
    const draftDripList = await this._repository.findOne({
      where: { id: request.draftDripListId },
      relations: ['_publisher', '_votingRounds'],
    });
    if (!draftDripList) {
      throw new NotFoundError(
        `DraftDripList with id ${request.draftDripListId} not found.`,
      );
    }

    return {
      id: draftDripList.id,
      name: draftDripList.name,
      description: draftDripList.description,
      currentVotingRound: draftDripList.currentVotingRound
        ? {
            id: draftDripList.currentVotingRound.id,
            startsAt: draftDripList.currentVotingRound.startsAt,
            endsAt: draftDripList.currentVotingRound.endsAt,
          }
        : null,
      publisher: {
        id: draftDripList.publisher.id,
        address: draftDripList.publisher.address,
        addressDriverId: draftDripList.publisher.addressId,
      },
    };
  }
}
