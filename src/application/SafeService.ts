import type SafeApiKit from '@safe-global/api-kit';
import type { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';
import type { Logger } from 'winston';
import type { IAuthStrategy } from './Auth';
import type IVotingRoundRepository from '../domain/votingRoundAggregate/IVotingRoundRepository';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';
import shouldNeverHappen from './shouldNeverHappen';
import type { Address } from '../domain/typeUtils';
import type { DripList } from '../domain/DripList';
import type ISafeService from './interfaces/ISafeService';
import type { SafeTx } from '../domain/linkedDripList/Link';

export default class SafeService implements ISafeService {
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _client: GraphQLClient;
  private readonly _safeApiKit: SafeApiKit;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    client: GraphQLClient,
    auth: IAuthStrategy,
    votingRoundRepository: IVotingRoundRepository,
    safeApiKit: SafeApiKit,
    logger: Logger,
  ) {
    this._auth = auth;
    this._client = client;
    this._logger = logger;
    this._safeApiKit = safeApiKit;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async getSafeTransaction(
    safeTransactionHash: string,
  ): Promise<SafeTx> {
    const {
      safe: safeAddress,
      isExecuted,
      isSuccessful,
    } = await this._safeApiKit.getTransaction(safeTransactionHash);

    if (isExecuted && !isSuccessful) {
      throw new Error(
        'Safe transaction was executed but not successful. Link will never be completed.',
      );
    }

    return {
      safeAddress: safeAddress as Address,
      transactionHash: safeTransactionHash,
      isExecuted,
      isSuccessful,
    };
  }

  public async checkSafeTxAndLinkPending(
    votingRound: VotingRound,
  ): Promise<void> {
    const safeTransactionHash =
      votingRound?._link?._safeTransactionHash ||
      shouldNeverHappen('Missing Safe transaction hash while linking pending.');

    const dripListId =
      votingRound._dripListId ||
      shouldNeverHappen(
        'Missing Drip List ID while linking pending voting round.',
      );

    const safeTx = await this.getSafeTransaction(safeTransactionHash);

    if (safeTx.isExecuted) {
      this._logger.info(
        `Safe transaction '${safeTransactionHash}' for voting round '${votingRound._id}' is executed. Marking link as completed...`,
      );

      const { dripList } = await this._client.request<{ dripList: DripList }>(
        gql`
          query DripList($dripListId: ID!) {
            dripList(id: $dripListId) {
              latestVotingRoundId
              owner {
                address
              }
            }
          }
        `,
        {
          dripListId,
        },
      );

      if (dripList) {
        await this._auth.verifyDripListOwnership(votingRound, dripListId);

        (
          votingRound._link ||
          shouldNeverHappen('Missing link while completing pending link.')
        ).markSafeTransactionAsExecuted();

        await this._votingRoundRepository.save(votingRound);

        this._logger.info(`
          Link '${votingRound._link?._id}' for voting round '${votingRound._id}' is completed.
        `);
      }
    }
  }
}
