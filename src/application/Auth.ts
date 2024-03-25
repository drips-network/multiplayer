import { verifyMessage as ethersVerifyMessage } from 'ethers';
import type { UUID } from 'crypto';
import type { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';
import type { Logger } from 'winston';
import type { Address, DripListId } from '../domain/typeUtils';
import { BadRequestError, UnauthorizedError } from './errors';
import type { DripList } from '../domain/DripList';
import type IVotingRoundRepository from '../domain/votingRoundAggregate/IVotingRoundRepository';
import appSettings from '../appSettings';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from '../domain/votingRoundAggregate/Vote';
import shouldNeverHappen from './shouldNeverHappen';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';

export default class Auth {
  private readonly _logger: Logger;
  private readonly _client: GraphQLClient;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    client: GraphQLClient,
    votingRoundRepository: IVotingRoundRepository,
  ) {
    this._logger = logger;
    this._client = client;
    this._votingRoundRepository = votingRoundRepository;
  }

  public static verifyMessage(
    message: string,
    signature: string,
    signerAddress: Address,
    currentTime: Date,
    logger: Logger | undefined = undefined,
  ): void {
    logger?.info(
      `Verifying reconstructed message '${message}' with signature '${signature}' for signer '${signerAddress}'...`,
    );

    const originalSigner = ethersVerifyMessage(message, signature);

    if (originalSigner.toLowerCase() !== signerAddress.toLowerCase()) {
      logger?.info(
        `Signature '${signature}' is not valid for signer '${signerAddress}': Original signer is '${originalSigner}'.`,
      );

      throw new UnauthorizedError('Signature is not valid.');
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (currentTime < oneDayAgo || currentTime > now) {
      logger?.info(
        `The current time '${currentTime}' is not within the last 24 hours.`,
      );

      throw new UnauthorizedError('Vote is outdated.');
    }

    logger?.info(
      `Signature '${signature}' is valid for signer '${signerAddress}'.`,
    );
  }

  public static REVEAL_VOTES_MESSAGE = (
    publisherAddress: Address,
    votingRoundId: UUID,
    currentTime: Date,
  ) =>
    `Reveal the votes for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime}.`;

  public static REVEAL_RESULT_MESSAGE = (
    publisherAddress: Address,
    votingRoundId: UUID,
    currentTime: Date,
  ) =>
    `Reveal the result for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime}.`;

  public static VOTE_MESSAGE_TEMPLATE = (
    currentTime: Date,
    voterAddress: string,
    votingRoundId: string,
    receivers: (
      | Omit<ProjectReceiver, 'accountId'>
      | Omit<AddressReceiver, 'accountId'>
      | DripListReceiver
    )[],
  ) => {
    const sortedReceivers = receivers
      .map((r) => {
        switch (r.type) {
          case 'project':
            return ['project', r.url, r.weight];
          case 'address':
            return ['address', r.address, r.weight];
          case 'dripList':
            return ['drip-list', r.accountId, r.weight];
          default:
            return shouldNeverHappen();
        }
      })
      .sort((a, b) => Number(a[1]) - Number(b[1]));

    return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(sortedReceivers)}`;
  };

  public static DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: Address,
    votingRoundId: string,
  ) =>
    `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

  public static START_VOTING_ROUND_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: Address,
    dripListId: string,
    collaborators: Address[],
  ) => {
    const sortedCollaborators = collaborators.sort(
      (a, b) => Number(a) - Number(b),
    );

    return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(sortedCollaborators)}`;
  };

  public static CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: Address,
    collaborators: string[],
  ) => {
    const sortedCollaborators = collaborators.sort(
      (a, b) => Number(a) - Number(b),
    );

    return `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(sortedCollaborators)}`;
  };

  public async verifyDripListOwnership(
    votingRound: VotingRound,
    dripListId: DripListId,
  ): Promise<void> {
    if (votingRound._dripListId && votingRound._dripListId !== dripListId) {
      this._logger.error(
        `Drip List ID '${dripListId}' does not match the stored Drip List ID '${votingRound?._dripListId}'.`,
      );

      throw new BadRequestError(
        "The provided Drip List ID does not match the voting round's Drip List ID.",
      );
    }

    const dripList = await this._client.request<DripList>(
      gql`
        query DripList($dripListId: ID!) {
          dripList(id: $dripListId) {
            latestVotingRoundId
          }
        }
      `,
      { dripListId },
    );

    if (dripList.owner.address !== votingRound._publisher._address) {
      this._logger.error(
        `Unauthorized access to Drip List '${dripListId}' with real owner '${dripList.owner.address}' by '${votingRound._publisher._address}'.`,
      );

      throw new UnauthorizedError(
        'Unauthorized: The publisher is not the owner of the Drip List.',
      );
    }

    if (dripList.latestVotingRoundId !== votingRound._id) {
      this._logger.error(
        `Latest voting round '${dripList.latestVotingRoundId}' for Drip List '${dripListId}' does not match the voting round '${votingRound._id}'.`,
      );

      throw new BadRequestError(
        'The provided voting round is not the latest one.',
      );
    }
  }
}
