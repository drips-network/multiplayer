import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import { verifyMessage } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type ICollaboratorRepository from '../../domain/collaboratorAggregate/ICollaboratorRepository';
import { assertIsAccountId, assertIsAddress } from '../../domain/typeUtils';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import Auth from '../../application/Auth';

type CastVoteCommand = CastVoteRequest & { votingRoundId: UUID };

export default class CastVoteUseCase implements UseCase<CastVoteCommand> {
  private readonly _logger: Logger;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _collaboratorRepository: ICollaboratorRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: ICollaboratorRepository,
  ) {
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
    this._collaboratorRepository = collaboratorRepository;
  }

  public async execute(command: CastVoteCommand): Promise<void> {
    const { votingRoundId, receivers, signature, date, collaboratorAddress } =
      command;

    this._logger.info(
      `Casting a vote for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    assertIsAddress(collaboratorAddress);
    const collaborator =
      await this._collaboratorRepository.getByAddress(collaboratorAddress);

    if (!collaborator) {
      throw new NotFoundError(`Collaborator not found.`);
    }

    const receiverEntities: Receiver[] = receivers.map((receiver) => {
      assertIsAccountId(receiver.accountId);

      return receiver as Receiver;
    });

    verifyMessage(
      Auth.VOTE_MESSAGE_TEMPLATE(
        new Date(date),
        collaboratorAddress,
        votingRoundId,
        receivers.map((r) => r.accountId),
      ),
      signature,
    );

    collaborator._votes
      ?.filter((v) => v._id === votingRoundId)
      .forEach((vote) => {
        if (vote._updatedAt > new Date(date)) {
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
