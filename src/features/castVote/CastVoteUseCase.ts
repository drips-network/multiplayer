import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import { verifyMessage } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type ICollaboratorRepository from '../../domain/collaboratorAggregate/ICollaboratorRepository';
import type { Address } from '../../domain/typeUtils';
import { assertIsAccountId, assertIsAddress } from '../../domain/typeUtils';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';

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
      throw new NotFoundError(`Voting round not found.`);
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

    this._verifyVote(
      collaboratorAddress,
      votingRoundId,
      receiverEntities,
      date,
      signature,
    );

    collaborator._votes
      ?.filter((v) => v._id === votingRoundId)
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

  private _verifyVote(
    collaboratorAddress: Address,
    votingRoundId: UUID,
    receivers: Receiver[],
    date: Date,
    signature: string,
  ): void {
    const reconstructedMessage = `On the ${new Date(date).toISOString()}, I '${collaboratorAddress}', participate in Voting Round with ID '${votingRoundId}' and vote for the following receivers: ${JSON.stringify(receivers)}`;

    const originalSigner = verifyMessage(reconstructedMessage, signature);

    if (originalSigner.toLowerCase() !== collaboratorAddress.toLowerCase()) {
      throw new UnauthorizedError('Signature is not valid.');
    }

    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    if (date < twoMinutesAgo || date > now) {
      throw new UnauthorizedError('Vote is outdated.');
    }
  }
}
