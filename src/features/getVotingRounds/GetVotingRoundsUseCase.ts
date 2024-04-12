import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { Address, DripListId } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import { toDto } from '../../application/dtos/ReceiverDto';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';

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
        dripListId: votingRound._dripListId || null,
        name: votingRound._name || null,
        description: votingRound._description || null,
        publisherAddress: votingRound._publisher._address,
        privateVotes: votingRound._privateVotes,
        linkedAt: votingRound.linkedAt || null,
        result:
          (votingRound._privateVotes &&
            votingRound.status !== VotingRoundStatus.Completed &&
            votingRound.status !== VotingRoundStatus.Linked) ||
          !votingRound._votes?.length
            ? null
            : votingRound.getResult().map((receiver) => toDto(receiver)),
        votes: votingRound._privateVotes
          ? null
          : votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
              collaboratorAddress: collaboratorsWithVotes.collaborator._address,
              votedAt: collaboratorsWithVotes.latestVote?._updatedAt || null,
              latestVote:
                collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
                  toDto(receiver),
                ) || null,
            })),
      })),
    };
  }
}
