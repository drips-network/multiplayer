import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { LinkRequest } from './LinkRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { BadRequestError, NotFoundError } from '../../application/errors';
import { assertIsAddress } from '../../domain/typeUtils';
import type IPublisherRepository from '../../domain/publisherAggregate/IPublisherRepository';

export default class LinkUseCase implements UseCase<LinkRequest> {
  private readonly _logger: Logger;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _publisherRepository: IPublisherRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: IPublisherRepository,
  ) {
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
    this._publisherRepository = collaboratorRepository;
  }

  public async execute(request: LinkRequest): Promise<void> {
    // TODO: Verify the request is coming from the collaborator by checking the signature token.

    const { votingRoundId, publisherAddress } = request;

    this._logger.info(`Linking voting round '${votingRoundId}'...`);

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`Voting round not found.`);
    }

    assertIsAddress(publisherAddress);
    const publisher =
      await this._publisherRepository.getByAddress(publisherAddress);

    if (!publisher) {
      throw new NotFoundError(`Collaborator not found.`);
    }

    if (votingRound._publisher._address !== publisherAddress) {
      throw new BadRequestError(
        'The publisher is not the owner of the voting round.',
      );
    }

    votingRound.link();

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Voting round '${votingRoundId}' linked to DripList '${votingRound._dripListId}'.`,
    );
  }
}
