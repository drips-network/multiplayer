import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { LinkRequest } from './LinkRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { BadRequestError, NotFoundError } from '../../application/errors';
import { toDripListId } from '../../domain/typeUtils';
import type Auth from '../../application/Auth';
import shouldNeverHappen from '../../application/shouldNeverHappen';

type LinkCommand = LinkRequest & {
  votingRoundId: UUID;
};

export default class LinkUseCase implements UseCase<LinkCommand> {
  private readonly _auth: Auth;
  private readonly _logger: Logger;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    auth: Auth,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(request: LinkCommand): Promise<void> {
    const { votingRoundId, dripListId } = request;

    this._logger.info(`Linking voting round '${votingRoundId}'...`);

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    if (votingRound._dripListId && dripListId) {
      throw new BadRequestError(
        `Voting round already connected to a DripList. Do not provide a Drip List ID for an existing Drip List.`,
      );
    }

    if (!votingRound._dripListId && !dripListId) {
      throw new BadRequestError(`Missing Drip List ID.`);
    }

    if (votingRound._dripListId) {
      await this._auth.verifyDripListOwnership(
        votingRound,
        votingRound._dripListId,
      );

      votingRound.linkToExistingDripList();
    } else if (dripListId) {
      await this._auth.verifyDripListOwnership(
        votingRound,
        toDripListId(dripListId),
      );

      votingRound.linkToNewDripList(toDripListId(dripListId));
    } else {
      shouldNeverHappen();
    }

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `voting round '${votingRoundId}' linked to DripList '${votingRound._dripListId}'.`,
    );
  }
}
