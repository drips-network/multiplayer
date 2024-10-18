import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { LinkRequest } from './LinkRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { BadRequestError, NotFoundError } from '../../application/errors';
import { toDripListId } from '../../domain/typeUtils';
import shouldNeverHappen from '../../application/shouldNeverHappen';
import type ISafeService from '../../application/interfaces/ISafeService';
import type { SafeTx } from '../../domain/linkedDripList/Link';
import type { IAuthStrategy } from '../../application/Auth';

export type LinkCommand = LinkRequest & {
  votingRoundId: UUID;
};

export default class LinkUseCase implements UseCase<LinkCommand> {
  private readonly _auth: IAuthStrategy;
  private readonly _logger: Logger;
  private readonly _safeService: ISafeService;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    safeService: ISafeService,
    auth: IAuthStrategy,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._safeService = safeService;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(request: LinkCommand): Promise<void> {
    const { votingRoundId, dripListId } = request;

    const safeTransactionHash =
      'safeTransactionHash' in request
        ? request.safeTransactionHash
        : undefined;

    this._logger.info(`Linking voting round '${votingRoundId}'...`);

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    if (safeTransactionHash && !dripListId) {
      throw new BadRequestError(
        `Drip List ID is required when providing a safe transaction hash.`,
      );
    }

    if (!votingRound._dripListId && !dripListId) {
      throw new BadRequestError(
        `A Drip List ID is not set for the voting round and not provided in the request.`,
      );
    }

    if (
      votingRound._dripListId &&
      dripListId &&
      votingRound._dripListId !== toDripListId(dripListId)
    ) {
      throw new BadRequestError(
        'A Drip List ID is already set for this voting round and the provided Drip List ID does not match.',
      );
    }

    const dlId = dripListId
      ? toDripListId(dripListId)
      : votingRound._dripListId ||
        shouldNeverHappen('Found no Drip List ID while linking.');

    let safeTx: SafeTx | undefined;
    if (safeTransactionHash) {
      safeTx = await this._safeService.getSafeTransaction(
        safeTransactionHash,
        votingRound._chainId,
      );
    } else {
      await this._auth.verifyDripListOwnership(votingRound, dlId);
    }

    await votingRound.linkToDripList(dlId, safeTx);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Voting round '${votingRoundId}' ${safeTransactionHash ? '(pending Safe tx)' : ''} linked to DripList '${votingRound._dripListId}'.`,
    );
  }
}
