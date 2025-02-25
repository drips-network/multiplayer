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
import type ISafeApiKit from './interfaces/ISafeAdapter';
import { getNetwork, type ChainId } from './network';

export default class SafeService implements ISafeService {
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _client: GraphQLClient;
  private readonly _safeApiKit: ISafeApiKit;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    client: GraphQLClient,
    auth: IAuthStrategy,
    votingRoundRepository: IVotingRoundRepository,
    safeApiKit: ISafeApiKit,
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
    chainId: ChainId,
  ): Promise<SafeTx> {
    const {
      safe: safeAddress,
      isExecuted,
      isSuccessful,
    } = await this._safeApiKit.getTransaction(safeTransactionHash, chainId);

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

    const { isExecuted, isSuccessful, safeAddress } =
      await this.getSafeTransaction(safeTransactionHash, votingRound._chainId);

    if (safeAddress !== votingRound.publisherAddress) {
      shouldNeverHappen(
        'Error while trying to complete link: Safe transaction does not belong to the voting round publisher.',
      );
    }

    if (isExecuted && isSuccessful) {
      this._logger.info(
        `Safe transaction '${safeTransactionHash}' for voting round '${votingRound._id}' is executed. Marking link as completed...`,
      );

      const { dripList } = await this._client.request<{ dripList: DripList }>(
        gql`
          query DripList($dripListId: ID!, $chain: SupportedChain!) {
            dripList(id: $dripListId, chain: $chain) {
              latestVotingRoundId
              owner {
                address
              }
            }
          }
        `,
        {
          dripListId,
          chain: getNetwork(votingRound._chainId).gqlName,
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
