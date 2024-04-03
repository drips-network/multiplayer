import type { UUID } from 'crypto';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { toDto } from '../../application/dtos/ReceiverDto';
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
  private readonly _logger: Logger;
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository, logger: Logger) {
    this._logger = logger;
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

    if (votingRound._privateVotes) {
      if (!signature || !date) {
        throw new UnauthorizedError(
          `Authentication is required for private voting rounds.`,
        );
      } else {
        await Auth.verifyMessage(
          Auth.REVEAL_VOTES_MESSAGE(
            votingRound._publisher._address,
            votingRoundId,
            new Date(date),
          ),
          signature,
          votingRound._publisher._address,
          new Date(date),
          this._logger,
        );
      }
    }

    return {
      votes: votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
        collaboratorAddress: collaboratorsWithVotes.collaborator._address,
        latestVote:
          collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
            toDto(receiver),
          ) || null,
      })),
    };
  }
}
