import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { Address, DripListId } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';

export default class GetVotingRoundsUseCase
  implements UseCase<GetVotingRoundsRequest, GetVotingRoundsResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundsRequest,
  ): Promise<GetVotingRoundsResponse> {
    let publisherAddress: Address | undefined;

    if (request.publisherAddress) {
      assertIsAddress(request.publisherAddress);

      publisherAddress = request.publisherAddress;
    }

    let dripListId: DripListId | undefined;

    if (request.dripListId) {
      dripListId = toDripListId(request.dripListId);
    }

    const votingRounds = await this._repository.getByFilter({
      publisherAddress,
      dripListId,
    });

    return {
      votingRounds: votingRounds.map((votingRound) => ({
        id: votingRound._id,
        startsAt: votingRound._startsAt,
        endsAt: votingRound._endsAt,
        status: votingRound.status,
        dripListId: votingRound._dripListId,
        name: votingRound._name,
        description: votingRound._description,
        publisherAddress: votingRound._publisher._address,
      })),
    };
  }
}
