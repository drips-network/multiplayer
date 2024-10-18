import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { NominateRequest } from './NominateRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { BadRequestError, NotFoundError } from '../../application/errors';
import Nomination from '../../domain/votingRoundAggregate/Nomination';
import type { IAuthStrategy } from '../../application/Auth';
import { NOMINATE_MESSAGE_TEMPLATE } from '../../application/Auth';
import { assertIsAddress } from '../../domain/typeUtils';
import { isValidHttpsUrl } from '../../application/utils';
import { ReceiverMapperFactory } from '../../application/ReceiverMapper';

export type NominateCommand = NominateRequest & { votingRoundId: UUID };

export default class NominateUseCase implements UseCase<NominateCommand> {
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    auth: IAuthStrategy,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(command: NominateCommand): Promise<void> {
    const {
      date,
      signature,
      nominatedBy,
      description,
      votingRoundId,
      impactMetrics,
      nomination: nominationDto,
    } = command;

    this._logger.info(
      `Nominating receiver ${JSON.stringify(nominationDto, null, 2)} for voting round '${votingRoundId}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    impactMetrics.forEach((metric) => {
      if (!isValidHttpsUrl(metric.link)) {
        throw new BadRequestError(`Invalid link: "${metric.link}".`);
      }
    });

    const receiver = await ReceiverMapperFactory.create(
      votingRound._chainId,
    ).mapToNominationReceiver(nominationDto);

    assertIsAddress(nominatedBy);

    const message = NOMINATE_MESSAGE_TEMPLATE(
      nominatedBy,
      votingRoundId,
      date,
      receiver,
      votingRound._chainId,
    );

    await this._auth.verifyMessage(
      message,
      signature,
      votingRound._publisher._address,
      date,
      votingRound._chainId,
    );

    const nomination = Nomination.create(
      votingRound,
      receiver,
      nominatedBy,
      description,
      impactMetrics,
    );

    votingRound.nominate(nomination);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Nominated successfully receiver ${JSON.stringify(nominationDto, null, 2)} for voting round '${votingRoundId}'. Nomination id: ${nomination._id}`,
    );
  }
}
