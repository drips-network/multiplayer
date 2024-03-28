import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type ICollaboratorRepository from '../../domain/collaboratorAggregate/ICollaboratorRepository';
import { assertIsAddress } from '../../domain/typeUtils';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import Auth from '../../application/Auth';
import type IReceiverService from '../../application/interfaces/IReceiverService';

type CastVoteCommand = CastVoteRequest & { votingRoundId: UUID };

export default class CastVoteUseCase implements UseCase<CastVoteCommand> {
  private readonly _logger: Logger;
  private readonly _receiverService: IReceiverService;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _collaboratorRepository: ICollaboratorRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: ICollaboratorRepository,
    receiverService: IReceiverService,
  ) {
    this._logger = logger;
    this._receiverService = receiverService;
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

    const receiverEntities: Receiver[] = await Promise.all(
      receivers.map(async (receiverDto) =>
        this._receiverService.mapToReceiver(receiverDto),
      ),
    );

    this._logger.info(
      `Receivers for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}' are: ${JSON.stringify(
        receiverEntities,
        null,
        2,
      )}`,
    );

    Auth.verifyMessage(
      Auth.VOTE_MESSAGE_TEMPLATE(
        new Date(date),
        collaboratorAddress,
        votingRoundId,
        receiverEntities,
      ),
      signature,
      collaboratorAddress,
      new Date(date),
      this._logger,
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
