import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundVotesRequest } from './GetVotingRoundVotesRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { ReceiverDto } from '../../application/dtos/ReceiverDto';
import type { GetVotingRoundVotesResponse } from './GetVotingRoundVotesResponse';

export default class GetVotesUseCase
  implements UseCase<GetVotingRoundVotesRequest, GetVotingRoundVotesResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundVotesRequest,
  ): Promise<GetVotingRoundVotesResponse> {
    const votingRound = await this._repository.getById(request.votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return {
      votes: votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
        collaboratorAddress: collaboratorsWithVotes.collaborator._address,
        latestVote:
          collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
            this._toDto(receiver),
          ) || undefined,
      })),
    };
  }

  private _toDto(receiver: Receiver): ReceiverDto {
    if ('address' in receiver) {
      return {
        accountId: receiver.accountId,
        address: receiver.address,
        weight: receiver.weight,
        type: receiver.type,
      };
    }
    if ('url' in receiver) {
      return {
        accountId: receiver.accountId,
        url: receiver.url,
        weight: receiver.weight,
        type: receiver.type,
      };
    }

    return {
      accountId: receiver.accountId,
      weight: receiver.weight,
      type: receiver.type,
    };
  }
}
