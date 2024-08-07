import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import { assertIsAddress } from '../../domain/typeUtils';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { IAuthStrategy } from '../../application/Auth';
import { VOTE_MESSAGE_TEMPLATE } from '../../application/Auth';
import type IReceiverMapper from '../../application/interfaces/IReceiverMapper';

export type CastVoteCommand = CastVoteRequest & { votingRoundId: UUID };

export default class CastVoteUseCase implements UseCase<CastVoteCommand> {
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _receiverMapper: IReceiverMapper;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    receiverMapper: IReceiverMapper,
    auth: IAuthStrategy,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._receiverMapper = receiverMapper;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(command: CastVoteCommand): Promise<void> {
    const { votingRoundId, receivers, signature, date, collaboratorAddress } =
      command;

    this._logger.info(
      `Casting a vote for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}'...`,
    );

    const votingRound = await this._votingRoundRepository.getById(
      votingRoundId,
      true,
    );

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    assertIsAddress(collaboratorAddress);
    const collaborator = votingRound._collaborators.find(
      (c) => c === collaboratorAddress,
    );

    if (!collaborator) {
      throw new NotFoundError(`Collaborator not found.`);
    }

    const receiverEntities: Receiver[] = await Promise.all(
      receivers.map(async (receiverDto) =>
        this._receiverMapper.mapToReceiver(receiverDto),
      ),
    );

    this._logger.info(
      `Receivers for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}' are: ${JSON.stringify(
        receiverEntities,
        null,
        2,
      )}`,
    );

    const message = VOTE_MESSAGE_TEMPLATE(
      date,
      collaboratorAddress,
      votingRoundId,
      receiverEntities,
    );

    await this._auth.verifyMessage(
      message,
      signature,
      collaboratorAddress,
      date,
    );

    votingRound._votes
      ?.filter((v) => v._votingRound._id === votingRoundId)
      .forEach((vote) => {
        if (vote._updatedAt > date) {
          throw new UnauthorizedError('Vote already casted.');
        }
      });

    votingRound.castVote(collaborator, receiverEntities);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Casted successfully a vote for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}'.`,
    );
  }
}
