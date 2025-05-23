import { verifyMessage as ethersVerifyMessage } from 'ethers';
import type { UUID } from 'crypto';
import type { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';
import type { Logger } from 'winston';
import type { AccountId, Address, DripListId } from '../domain/typeUtils';
import { BadRequestError, UnauthorizedError } from './errors';
import type { DripList } from '../domain/DripList';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from '../domain/votingRoundAggregate/Vote';
import shouldNeverHappen from './shouldNeverHappen';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';
import type {
  NominationReceiver,
  NominationStatus,
} from '../domain/votingRoundAggregate/Nomination';
import type ISafeAdapter from './interfaces/ISafeAdapter';
import type { ChainId } from './network';
import { getNetwork } from './network';

const GNOSIS_API_SAFES_BASE: { [chainId: number]: string } = {
  11155111: 'https://safe-transaction-sepolia.safe.global/',
  1: 'https://safe-transaction-mainnet.safe.global/',
};

export async function isSafe(address: string) {
  for (const apiBase of Object.values(GNOSIS_API_SAFES_BASE)) {
    const res = await fetch(`${apiBase}/api/v1/safes/${address}`);

    if (res.status === 200) {
      return true;
    }
  }

  return false;
}

export interface IAuthStrategy {
  verifyMessage(
    message: string,
    signature: string,
    signerAddress: Address,
    currentTime: Date,
    chainId: ChainId,
  ): Promise<void>;

  verifyDripListOwnership(
    votingRound: VotingRound,
    dripListId: DripListId,
  ): Promise<void>;
}

export class DevAuth implements IAuthStrategy {
  verifyMessage(): Promise<void> {
    return Promise.resolve();
  }
  verifyDripListOwnership(): Promise<void> {
    return Promise.resolve();
  }
}

export class Auth implements IAuthStrategy {
  private readonly _safeAdapter: ISafeAdapter;
  private readonly _logger: Logger;
  private readonly _client: GraphQLClient;

  public constructor(
    logger: Logger,
    client: GraphQLClient,
    safe: ISafeAdapter,
  ) {
    this._logger = logger;
    this._client = client;
    this._safeAdapter = safe;
  }

  public async verifyMessage(
    message: string,
    signature: string,
    signerAddress: Address,
    currentTime: Date,
    chainId: ChainId,
  ): Promise<void> {
    this._logger.info(
      `Verifying reconstructed message '${message}' with signature '${signature}' for signer '${signerAddress}'...`,
    );

    const isEoa = !(await isSafe(signerAddress));

    if (isEoa) {
      this._logger.info(`Signer '${signerAddress}' is EOA.`);

      const originalSigner = ethersVerifyMessage(message, signature);

      if (originalSigner.toLowerCase() !== signerAddress.toLowerCase()) {
        this._logger.info(
          `Signature '${signature}' is not valid for signer '${signerAddress}'. Original signer should be '${originalSigner}'. Checking if it's coming from Safe...`,
        );

        throw new UnauthorizedError('Invalid signature.');
      }
    } else {
      this._logger.info(`Signer '${signerAddress}' is a Safe.`);

      const isValid = await this._safeAdapter.isValidSignature(
        message,
        signature,
        signerAddress,
        chainId,
      );

      if (isValid) {
        this._logger.info(
          `Signature '${signature}' is valid for Safe '${signerAddress}'.`,
        );
      } else {
        this._logger.error(
          `Signature '${signature}' is not valid for Safe '${signerAddress}'.`,
        );

        throw new UnauthorizedError('Invalid signature.');
      }
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (currentTime < oneDayAgo || currentTime > now) {
      this._logger.info(
        `The current time '${currentTime.toISOString()}' is not within the last 24 hours.`,
      );

      throw new UnauthorizedError('Vote is outdated.');
    }

    this._logger.info(
      `Signature '${signature}' is valid for signer '${signerAddress}'.`,
    );
  }

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

    const result = await this._client.request<{ dripList: DripList }>(
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
      { dripListId, chain: getNetwork(votingRound._chainId).gqlName },
    );

    if (!result?.dripList) {
      this._logger.error(`Drip List with ID '${dripListId}' not found.`);

      throw new BadRequestError('Drip List not found.');
    }

    const { dripList } = result;

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

export const REVEAL_VOTES_MESSAGE_TEMPLATE = (
  publisherAddress: Address,
  votingRoundId: UUID,
  currentTime: Date,
  chainId: ChainId,
) =>
  `Reveal the votes for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const SET_NOMINATION_STATUS_MESSAGE_TEMPLATE = (
  publisherAddress: Address,
  votingRoundId: UUID,
  currentTime: Date,
  nominations: { accountId: AccountId; status: NominationStatus }[],
  chainId: ChainId,
) =>
  `Setting nominations statuses for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The statuses are: ${JSON.stringify(
    nominations,
  )}.`;

export const NOMINATE_MESSAGE_TEMPLATE = (
  nominatedBy: Address,
  votingRoundId: UUID,
  currentTime: Date,
  nomination: NominationReceiver,
  chainId: ChainId,
) =>
  `Nominating receiver for voting round with ID ${votingRoundId}, nominated by ${nominatedBy}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The nomination is: ${JSON.stringify(nomination)})`;

export const REVEAL_RESULT_MESSAGE_TEMPLATE = (
  publisherAddress: Address,
  votingRoundId: UUID,
  currentTime: Date,
  chainId: ChainId,
) =>
  `Reveal the result for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const VOTE_MESSAGE_TEMPLATE = (
  currentTime: Date,
  voterAddress: string,
  votingRoundId: string,
  receivers: (
    | Omit<ProjectReceiver, 'accountId'>
    | Omit<AddressReceiver, 'accountId'>
    | DripListReceiver
  )[],
  chainId: ChainId,
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
    .sort();

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(sortedReceivers)}`;
};

export const DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  votingRoundId: string,
  chainId: ChainId,
) =>
  `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  dripListId: string,
  chainId: ChainId,
) =>
  `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  chainId: ChainId,
) =>
  `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;

export const REVEAL_VOTE = (
  votingRoundId: UUID,
  currentTime: Date,
  chainId: ChainId,
) =>
  `Reveal my vote for the voting round with ID ${votingRoundId}, on chain ID ${chainId}. The current time is ${currentTime.toISOString()}.`;
