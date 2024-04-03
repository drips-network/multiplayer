import type { UUID } from 'crypto';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundResultResponse } from './GetVotingRoundResultResponse';
import Auth from '../../application/Auth';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';
import type IReceiverMapper from '../../application/interfaces/IReceiverMapper';

type GetVotingRoundResultCommand = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};

export default class GetVotingRoundResultUseCase
  implements UseCase<GetVotingRoundResultCommand, GetVotingRoundResultResponse>
{
  private readonly _logger: Logger;
  private readonly _receiverMapper: IReceiverMapper;
  private readonly _repository: IVotingRoundRepository;

  public constructor(
    repository: IVotingRoundRepository,
    logger: Logger,
    receiverMapper: IReceiverMapper,
  ) {
    this._logger = logger;
    this._repository = repository;
    this._receiverMapper = receiverMapper;
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
        await Auth.verifyMessage(
          Auth.REVEAL_RESULT_MESSAGE(
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
      result: votingRound
        .getResult()
        .map((receiver) => this._receiverMapper.mapToReceiverDto(receiver)),
    };
  }
}
