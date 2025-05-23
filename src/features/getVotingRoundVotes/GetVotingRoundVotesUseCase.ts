import type { UUID } from 'crypto';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundVotesResponse } from './GetVotingRoundVotesResponse';
import {
  REVEAL_VOTES_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../application/Auth';
import { ReceiverMapperFactory } from '../../application/ReceiverMapper';

export type GetVotingRoundVotesCommand = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};

export default class GetVotingRoundVotesUseCase
  implements UseCase<GetVotingRoundVotesCommand, GetVotingRoundVotesResponse>
{
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _repository: IVotingRoundRepository;

  public constructor(
    repository: IVotingRoundRepository,
    logger: Logger,
    auth: IAuthStrategy,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundVotesCommand,
  ): Promise<GetVotingRoundVotesResponse> {
    const { votingRoundId, date, signature } = request;

    const votingRound = await this._repository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    if (votingRound._areVotesPrivate) {
      if (!signature || !date) {
        throw new UnauthorizedError(
          `Authentication is required for private voting rounds.`,
        );
      } else {
        const message = REVEAL_VOTES_MESSAGE_TEMPLATE(
          votingRound._publisher._address,
          votingRoundId,
          new Date(date),
          votingRound._chainId,
        );

        await this._auth.verifyMessage(
          message,
          signature,
          votingRound._publisher._address,
          new Date(date),
          votingRound._chainId,
        );
      }
    }

    return {
      votes: votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
        collaboratorAddress: collaboratorsWithVotes.collaborator,
        latestVote:
          collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
            ReceiverMapperFactory.create(votingRound._chainId).mapToReceiverDto(
              receiver,
            ),
          ) || null,
      })),
    };
  }
}
