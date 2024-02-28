import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListByIdResponse';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListByIdRequest';
import { NotFoundError } from '../../application/errors';

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
      name: draftDripList._name,
      description: draftDripList._description,
      currentVotingRound: draftDripList.currentVotingRound
        ? {
            id: draftDripList.currentVotingRound.id,
            startsAt: draftDripList.currentVotingRound._startsAt,
            endsAt: draftDripList.currentVotingRound._endsAt,
          }
        : null,
      publisher: {
        id: draftDripList._publisher.id,
        address: draftDripList._publisher._address,
        addressDriverId: draftDripList._publisher._addressId,
      },
    };
  }
}
