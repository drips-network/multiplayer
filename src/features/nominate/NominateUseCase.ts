import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { NominateRequest } from './NominateRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError } from '../../application/errors';
import Nomination from '../../domain/votingRoundAggregate/Nomination';
import type IReceiverService from '../../application/interfaces/IReceiverService';

type NominateCommand = NominateRequest & { votingRoundId: UUID };

export default class NominateUseCase implements UseCase<NominateCommand> {
  private readonly _logger: Logger;
  private readonly _receiverService: IReceiverService;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    receiverService: IReceiverService,
  ) {
    this._logger = logger;
    this._receiverService = receiverService;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(command: NominateCommand): Promise<void> {
    const { votingRoundId, nomination: nominationDto } = command;

    this._logger.info(
      `Nominating receiver ${JSON.stringify(nominationDto, null, 2)} for voting round '${votingRoundId}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    const receiver =
      await this._receiverService.mapToNominationReceiver(nominationDto);

    const nomination = Nomination.create(votingRound, receiver);

    votingRound.nominate(nomination);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Nominated successfully receiver ${JSON.stringify(nominationDto, null, 2)} for voting round '${votingRoundId}'. Nomination id: ${nomination._id}`,
    );
  }
}
