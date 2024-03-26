import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundResultResponse } from './GetVotingRoundResultResponse';
import { toDto } from '../../application/dtos/ReceiverDto';
import Auth from '../../application/Auth';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';

type GetVotingRoundResultCommand = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};

export default class GetVotingRoundResultUseCase
  implements UseCase<GetVotingRoundResultCommand, GetVotingRoundResultResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundResultCommand,
  ): Promise<GetVotingRoundResultResponse> {
    const { votingRoundId, date, signature } = request;

    const votingRound = await this._repository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    if (
      votingRound._privateVotes &&
      votingRound.status !== VotingRoundStatus.Completed
    ) {
      if (!signature || !date) {
        throw new UnauthorizedError(
          `Authentication is required for private voting rounds.`,
        );
      } else {
        Auth.verifyMessage(
          Auth.REVEAL_RESULT_MESSAGE(
            votingRound._publisher._address,
            votingRoundId,
            new Date(date),
          ),
          signature,
          votingRound._publisher._address,
          new Date(date),
        );
      }
    }

    return {
      result: votingRound.getResult().map((receiver) => toDto(receiver)),
    };
  }
}
