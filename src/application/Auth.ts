import {
  ethers,
  verifyMessage as ethersVerifyMessage,
  hashMessage,
} from 'ethers';
import type { UUID } from 'crypto';
import type { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-request';
import type { Logger } from 'winston';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import type { AccountId, Address, DripListId } from '../domain/typeUtils';
import { BadRequestError, UnauthorizedError } from './errors';
import type { DripList } from '../domain/DripList';
import appSettings from '../appSettings';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from '../domain/votingRoundAggregate/Vote';
import shouldNeverHappen from './shouldNeverHappen';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';
import provider from './provider';
import type {
  NominationReceiver,
  NominationStatus,
} from '../domain/votingRoundAggregate/Nomination';

const GNOSIS_API_SAFES_BASE: { [chainId: number]: string } = {
  11155111: 'https://safe-transaction-sepolia.safe.global/',
  1: 'https://safe-transaction-mainnet.safe.global/',
};

export async function isSafe(chainId: number, address: string) {
  const apiBase = GNOSIS_API_SAFES_BASE[chainId];
  if (!apiBase) return false;

  const res = await fetch(
    `${GNOSIS_API_SAFES_BASE[chainId]}/api/v1/safes/${address}`,
  );

  return res.status === 200;
}
export interface IAuthStrategy {
  verifyMessage(
    message: string,
    signature: string,
    signerAddress: Address,
    currentTime: Date,
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
  private readonly _logger: Logger;
  private readonly _client: GraphQLClient;

  public constructor(logger: Logger, client: GraphQLClient) {
    this._logger = logger;
    this._client = client;
  }

  public async verifyMessage(
    message: string,
    signature: string,
    signerAddress: Address,
    currentTime: Date,
  ): Promise<void> {
    this._logger.info(
      `Verifying reconstructed message '${message}' with signature '${signature}' for signer '${signerAddress}'...`,
    );

    const isEoa = !(await isSafe(appSettings.chainId, signerAddress));

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
      this._logger.info(`Signer '${signerAddress}' is a multisig.`);

      const hash = hashMessage(message);

      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: await provider.getSigner(0),
      });

      const safeSdk: Safe = await Safe.create({
        ethAdapter,
        safeAddress: signerAddress,
      });

      const isValid = await safeSdk.isValidSignature(hash, '0x');

      if (isValid) {
        this._logger.info(
          `Signature '${signature}' is valid for signer '${signerAddress}' using Safe.`,
        );
      } else {
        this._logger.error(
          `Signature '${signature}' is not valid for signer '${signerAddress}' using Safe.`,
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
        query DripList($dripListId: ID!) {
          dripList(id: $dripListId) {
            latestVotingRoundId
            owner {
              address
            }
          }
        }
      `,
      { dripListId },
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
) =>
  `Reveal the votes for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

export const SET_NOMINATION_STATUS_MESSAGE_TEMPLATE = (
  publisherAddress: Address,
  votingRoundId: UUID,
  currentTime: Date,
  nominations: { accountId: AccountId; status: NominationStatus }[],
) =>
  `Setting nominations statuses for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The statuses are: ${JSON.stringify(
    nominations,
  )}.`;

export const NOMINATE_MESSAGE_TEMPLATE = (
  nominatedBy: Address,
  votingRoundId: UUID,
  currentTime: Date,
  nomination: NominationReceiver,
) =>
  `Nominating receiver for voting round with ID ${votingRoundId}, nominated by ${nominatedBy}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The nomination is: ${JSON.stringify(nomination)})`;

export const REVEAL_RESULT_MESSAGE_TEMPLATE = (
  publisherAddress: Address,
  votingRoundId: UUID,
  currentTime: Date,
) =>
  `Reveal the result for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

export const VOTE_MESSAGE_TEMPLATE = (
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
    .sort();

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(sortedReceivers)}`;
};

export const DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  votingRoundId: string,
) =>
  `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  dripListId: string,
  collaborators: Address[],
) => {
  const sortedCollaborators = collaborators.sort();

  return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(sortedCollaborators)}`;
};

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: Address,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort();

  return `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(sortedCollaborators)}`;
};

export const REVEAL_VOTE = (votingRoundId: UUID, currentTime: Date) =>
  `Reveal my vote for the voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;
