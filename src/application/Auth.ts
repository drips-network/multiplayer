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
  ): void {
    const originalSigner = ethersVerifyMessage(message, signature);

    if (originalSigner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new UnauthorizedError('Signature is not valid.');
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (currentTime < oneDayAgo || currentTime > now) {
      throw new UnauthorizedError('Vote is outdated.');
    }
  }

  public static REVEAL_VOTES_MESSAGE = (
    votingRoundId: UUID,
    currentTime: Date,
  ) =>
    `Reveal the votes for voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime}.`;

  public static REVEAL_RESULT_MESSAGE = (
    votingRoundId: UUID,
    currentTime: Date,
  ) =>
    `Reveal the result for voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime}.`;

  public static VOTE_MESSAGE_TEMPLATE = (
    currentTime: Date,
    voterAddress: string,
    votingRoundId: string,
    receivers: string[],
  ) => {
    const sortedReceivers = receivers.sort((a, b) => Number(a) - Number(b));

    return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(sortedReceivers)}`;
  };

  public static DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: string,
    votingRoundId: string,
  ) =>
    `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

  public static START_VOTING_ROUND_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: string,
    dripListId: string,
    collaborators: string[],
  ) => {
    const sortedCollaborators = collaborators.sort(
      (a, b) => Number(a) - Number(b),
    );

    return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(sortedCollaborators)}`;
  };

  public static CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
    currentTime: Date,
    publisherAddress: string,
    collaborators: string[],
  ) => {
    const sortedCollaborators = collaborators.sort(
      (a, b) => Number(a) - Number(b),
    );

    return `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(sortedCollaborators)}`;
  };

  public async verifyDripListOwnership(
    dripListId: DripListId,
    publisherAddress: Address,
    votingRoundId: UUID,
  ): Promise<void> {
    const storedDripListId = (
      await this._votingRoundRepository.getById(votingRoundId)
    )?._dripListId;

    if (storedDripListId && storedDripListId !== dripListId) {
      this._logger.error(
        `Drip List ID '${dripListId}' does not match the stored Drip List ID '${storedDripListId}'.`,
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

    if (dripList.owner.address !== publisherAddress) {
      this._logger.error(
        `Unauthorized access to Drip List '${dripListId}' with real owner '${dripList.owner.address}' by '${publisherAddress}'.`,
      );

      throw new UnauthorizedError(
        'Unauthorized: The publisher is not the owner of the Drip List.',
      );
    }

    if (dripList.latestVotingRoundId !== votingRoundId) {
      this._logger.error(
        `Latest voting round '${dripList.latestVotingRoundId}' for Drip List '${dripListId}' does not match the voting round '${votingRoundId}'.`,
      );

      throw new BadRequestError(
        'The provided voting round is not the latest one.',
      );
    }
  }
}
