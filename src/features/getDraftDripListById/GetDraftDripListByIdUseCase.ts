import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { GetDraftDripListByIdResponse } from './GetDraftDripListByIdResponse';
import type { GetDraftDripListByIdRequest } from './GetDraftDripListByIdRequest';
import { NotFoundError } from '../../application/errors';
import type DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';

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
      where: { _id: request.id },
      relations: ['_publisher', '_votingRounds'],
      withDeleted: true,
    });
    if (!draftDripList) {
      throw new NotFoundError(`DraftDripList with id ${request.id} not found.`);
    }

    return {
      id: draftDripList._id,
      name: draftDripList._name,
      description: draftDripList._description,
      currentVotingRound: draftDripList.currentVotingRound
        ? {
            id: draftDripList.currentVotingRound._id,
            startsAt: draftDripList.currentVotingRound._startsAt,
            endsAt: draftDripList.currentVotingRound._endsAt,
            status: draftDripList.currentVotingRound.status,
          }
        : null,
      publisher: {
        address: draftDripList._publisher._address,
        addressDriverId: draftDripList._publisher._addressId,
      },
    };
  }
}
