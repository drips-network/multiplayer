import type { UUID } from 'crypto';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundResultResponse } from './GetVotingRoundResultResponse';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';
import {
  REVEAL_RESULT_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../application/Auth';
import { ReceiverMapperFactory } from '../../application/ReceiverMapper';

export type GetVotingRoundResultCommand = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};

export default class GetVotingRoundResultUseCase
  implements UseCase<GetVotingRoundResultCommand, GetVotingRoundResultResponse>
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
    command: GetVotingRoundResultCommand,
  ): Promise<GetVotingRoundResultResponse> {
    const { votingRoundId, date, signature } = command;

    const votingRound = await this._repository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    if (
      votingRound._areVotesPrivate &&
      votingRound.status !== VotingRoundStatus.Completed
    ) {
      if (!signature || !date) {
        throw new UnauthorizedError(
          `Authentication is required for private voting rounds.`,
        );
      } else {
        const message = REVEAL_RESULT_MESSAGE_TEMPLATE(
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
      result: votingRound
        .getResult()
        .map((receiver) =>
          ReceiverMapperFactory.create(votingRound._chainId).mapToReceiverDto(
            receiver,
          ),
        ),
    };
  }
}
