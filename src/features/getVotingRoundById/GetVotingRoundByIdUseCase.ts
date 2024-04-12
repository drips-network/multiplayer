import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundByIdResponse } from './GetVotingRoundByIdResponse';
import { toDto } from '../../application/dtos/ReceiverDto';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';

export default class GetVotingRoundByIdUseCase
  implements UseCase<GetVotingRoundByIdRequest, GetVotingRoundByIdResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundByIdRequest,
  ): Promise<GetVotingRoundByIdResponse> {
    const votingRound = await this._repository.getById(request.id);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return {
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
    };
  }
}
