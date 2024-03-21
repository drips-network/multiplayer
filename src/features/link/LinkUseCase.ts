import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { LinkRequest } from './LinkRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { BadRequestError, NotFoundError } from '../../application/errors';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import type IPublisherRepository from '../../domain/publisherAggregate/IPublisherRepository';
import type Auth from '../../application/Auth';

type LinkCommand = LinkRequest & {
  votingRoundId: UUID;
};

export default class LinkUseCase implements UseCase<LinkCommand> {
  private readonly _auth: Auth;
  private readonly _logger: Logger;
  private readonly _publisherRepository: IPublisherRepository;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: IPublisherRepository,
    auth: Auth,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
    this._publisherRepository = collaboratorRepository;
  }

  public async execute(request: LinkCommand): Promise<void> {
    const { votingRoundId, publisherAddress, dripListId } = request;

    this._logger.info(`Linking voting round '${votingRoundId}'...`);

    assertIsAddress(publisherAddress);

    this._auth.verifyDripListOwnership(
      toDripListId(dripListId),
      publisherAddress,
      votingRoundId,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

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
      `voting round '${votingRoundId}' linked to DripList '${votingRound._dripListId}'.`,
    );
  }
}
