import { verifyMessage } from 'ethers';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { ReceiverDto } from '../../application/dtos/ReceiverDto';
import type { GetVotingRoundVotesResponse } from './GetVotingRoundVotesResponse';
import Auth from '../../application/Auth';

type GetVotingRoundVotesCommand = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};

export default class GetVotingRoundVotesUseCase
  implements UseCase<GetVotingRoundVotesCommand, GetVotingRoundVotesResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundVotesCommand,
  ): Promise<GetVotingRoundVotesResponse> {
    const { votingRoundId, date, signature } = request;

    const votingRound = await this._repository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    if (votingRound._isPrivate) {
      if (!signature || !date) {
        throw new UnauthorizedError(
          `Authentication is required for private voting rounds.`,
        );
      } else {
        verifyMessage(
          Auth.REVEAL_VOTES_MESSAGE(votingRoundId, new Date(date)),
          signature,
        );
      }
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
