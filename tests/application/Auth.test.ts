import { Wallet, verifyMessage } from 'ethers';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { randomUUID } from 'crypto';
import type { GraphQLClient } from 'graphql-request';
import {
  Auth,
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  NOMINATE_MESSAGE_TEMPLATE,
  REVEAL_RESULT_MESSAGE_TEMPLATE,
  REVEAL_VOTES_MESSAGE_TEMPLATE,
  SET_NOMINATION_STATUS_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
  VOTE_MESSAGE_TEMPLATE,
} from '../../src/application/Auth';
import type {
  AccountId,
  Address,
  DripListId,
} from '../../src/domain/typeUtils';
import { yesterday } from '../testUtils';
import appSettings from '../../src/appSettings';
import type { AddressNominationReceiver } from '../../src/domain/votingRoundAggregate/Nomination';
import { NominationStatus } from '../../src/domain/votingRoundAggregate/Nomination';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type { SafeAdapter } from '../../src/application/SafeAdapter';

jest.mock('@safe-global/protocol-kit');

jest.mock('../../src/application/getProvider');

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');

  return {
    __esModule: true,
    ...originalModule,
    verifyMessage: jest.fn(),
  };
});
jest.mock('../../src/application/Auth', () => {
  const originalModule = jest.requireActual('../../src/application/Auth');

  return {
    __esModule: true,
    ...originalModule,
    isSafe: jest.fn(),
    fetch: jest.fn(),
  };
});

describe('Auth', () => {
  const loggerMock = { info: jest.fn(), error: jest.fn() } as any;
  const safeAdapterMock = {
    isValidSignature: jest.fn(),
  } as unknown as jest.Mocked<SafeAdapter>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('verifyMessage', () => {
    it('should throw when EOA singer is not the expected', async () => {
      // Arrange
      const originalSigner = Wallet.createRandom().address as Address;
      const otherSigner = Wallet.createRandom().address as Address;
      (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
          status: 404,
        }),
      );

      const auth = new Auth(loggerMock, null as any, safeAdapterMock);

      // Act
      const verify = () =>
        auth.verifyMessage('message', 'signature', otherSigner, new Date());

      // Assert
      expect(verify).rejects.toThrow('Invalid signature');
    });

    it('should not throw when EOA singer is the expected', async () => {
      // Arrange
      const originalSigner = Wallet.createRandom().address as Address;
      (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
          status: 404,
        }),
      );

      const auth = new Auth(loggerMock, null as any, safeAdapterMock);

      // Act
      const verify = () =>
        auth.verifyMessage('message', 'signature', originalSigner, new Date());

      // Assert
      expect(verify).not.toThrow();
    });

    it('should throw when multisig singer is not the expected', async () => {
      // Arrange
      const originalSigner = Wallet.createRandom().address as Address;
      const otherSigner = Wallet.createRandom().address as Address;
      (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
          status: 200,
        }),
      );

      (EthersAdapter as any as jest.Mock) = jest.fn();

      (Safe.create as jest.Mock).mockResolvedValueOnce({
        isValidSignature: jest.fn().mockReturnValueOnce(false),
      });

      const auth = new Auth(loggerMock, null as any, safeAdapterMock);

      // Act
      const verify = () =>
        auth.verifyMessage('message', 'signature', otherSigner, new Date());

      // Assert
      expect(verify).rejects.toThrow('Invalid signature');
    });

    it('should not throw when multisig singer is the expected', async () => {
      // Arrange
      const originalSigner = Wallet.createRandom().address as Address;
      (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
          status: 200,
        }),
      );

      (EthersAdapter as any as jest.Mock) = jest.fn();

      safeAdapterMock.isValidSignature.mockResolvedValueOnce(true);

      const auth = new Auth(loggerMock, null as any, safeAdapterMock);

      // Act
      const verify = () =>
        auth.verifyMessage('message', 'signature', originalSigner, new Date());

      // Assert
      expect(verify).not.toThrow();
    });

    it('should throw when signature is outdated', async () => {
      // Arrange
      const originalSigner = Wallet.createRandom().address as Address;
      (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({}),
          status: 404,
        }),
      );

      const auth = new Auth(loggerMock, null as any, safeAdapterMock);

      // Act
      const verify = () =>
        auth.verifyMessage('message', 'signature', originalSigner, yesterday);

      // Assert
      expect(verify).rejects.toThrow('Vote is outdated.');
    });

    describe('verifyDripListOwnership', () => {
      it('should throw when the Drip List ID does not match the stored Drip List ID', async () => {
        // Arrange
        const dripListId = 'dripListId' as DripListId;
        const votingRound = { _dripListId: 'otherDripListId' } as any;

        const auth = new Auth(loggerMock, null as any, safeAdapterMock);

        // Act
        const verifyDripListOwnership = () =>
          auth.verifyDripListOwnership(votingRound, dripListId);

        // Assert
        expect(verifyDripListOwnership).rejects.toThrow(
          `The provided Drip List ID does not match the voting round's Drip List ID.`,
        );
      });

      it('should throw when the Drip List is not found', async () => {
        // Arrange
        const dripListId = 'dripListId' as DripListId;
        const votingRound = { _dripListId: dripListId } as any;

        const clientMock = {
          request: jest.fn(),
        } as unknown as jest.Mocked<GraphQLClient>;

        const auth = new Auth(loggerMock, clientMock, safeAdapterMock);

        // Act
        const verifyDripListOwnership = () =>
          auth.verifyDripListOwnership(votingRound, dripListId);

        // Assert
        expect(verifyDripListOwnership).rejects.toThrow(`Drip List not found.`);
      });

      it('should throw when the publisher is not the owner of the Drip List', async () => {
        // Arrange
        const dripListId = 'dripListId' as DripListId;
        const votingRound = {
          _dripListId: dripListId,
          _publisher: { _address: Wallet.createRandom().address },
        } as unknown as VotingRound;

        const clientMock = {
          request: jest.fn(),
        } as unknown as jest.Mocked<GraphQLClient>;

        clientMock.request.mockResolvedValueOnce({
          dripList: {
            owner: {
              address: Wallet.createRandom().address,
            },
          },
        });

        const auth = new Auth(loggerMock, clientMock, safeAdapterMock);

        // Act
        const verifyDripListOwnership = () =>
          auth.verifyDripListOwnership(votingRound, dripListId);

        // Assert
        expect(verifyDripListOwnership).rejects.toThrow(
          `Unauthorized: The publisher is not the owner of the Drip List.`,
        );
      });

      it('should throw when the provided voting round is not the latest one.', async () => {
        // Arrange
        const { address } = Wallet.createRandom();
        const dripListId = 'dripListId' as DripListId;
        const votingRound = {
          _id: randomUUID(),
          _dripListId: dripListId,
          _publisher: { _address: address },
        } as unknown as VotingRound;

        const clientMock = {
          request: jest.fn(),
        } as unknown as jest.Mocked<GraphQLClient>;

        clientMock.request.mockResolvedValueOnce({
          dripList: {
            latestVotingRoundId: randomUUID(),
            owner: {
              address,
            },
          },
        });

        const auth = new Auth(loggerMock, clientMock, safeAdapterMock);

        // Act
        const verifyDripListOwnership = () =>
          auth.verifyDripListOwnership(votingRound, dripListId);

        // Assert
        expect(verifyDripListOwnership).rejects.toThrow(
          `The provided voting round is not the latest one.`,
        );
      });

      it('should not throw when ownership is verified', async () => {
        // Arrange
        const { address } = Wallet.createRandom();
        const dripListId = 'dripListId' as DripListId;
        const votingRound = {
          _id: randomUUID(),
          _dripListId: dripListId,
          _publisher: { _address: address },
        } as unknown as VotingRound;

        const clientMock = {
          request: jest.fn(),
        } as unknown as jest.Mocked<GraphQLClient>;

        clientMock.request.mockResolvedValueOnce({
          dripList: {
            latestVotingRoundId: votingRound._id,
            owner: {
              address,
            },
          },
        });

        const auth = new Auth(loggerMock, clientMock, safeAdapterMock);

        // Act
        const verifyDripListOwnership = () =>
          auth.verifyDripListOwnership(votingRound, dripListId);

        // Assert
        expect(verifyDripListOwnership).not.toThrow();
      });
    });

    describe('REVEAL_VOTES_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const currentTime = new Date();
        const publisherAddress = Wallet.createRandom().address;
        const votingRoundId = randomUUID();

        // Act
        const message = REVEAL_VOTES_MESSAGE_TEMPLATE(
          publisherAddress as Address,
          votingRoundId,
          currentTime,
        );

        // Assert
        expect(message).toBe(
          `Reveal the votes for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`,
        );
      });
    });

    describe('SET_NOMINATION_STATUS_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const currentTime = new Date();
        const publisherAddress = Wallet.createRandom().address;
        const votingRoundId = randomUUID();
        const nominations = [
          {
            accountId: 'accountId' as AccountId,
            status: NominationStatus.Accepted,
          },
        ];

        // Act
        const message = SET_NOMINATION_STATUS_MESSAGE_TEMPLATE(
          publisherAddress as Address,
          votingRoundId,
          currentTime,
          nominations,
        );

        // Assert
        expect(message).toBe(
          `Setting nominations statuses for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The statuses are: ${JSON.stringify(
            nominations,
          )}.`,
        );
      });
    });

    describe('NOMINATE_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const nominatedBy = Wallet.createRandom().address as Address;
        const votingRoundId = randomUUID();
        const currentTime = new Date();
        const nomination = {
          address: Wallet.createRandom().address,
          accountId: 'accountId' as AccountId,
          type: 'address',
        } as AddressNominationReceiver;

        // Act
        const message = NOMINATE_MESSAGE_TEMPLATE(
          nominatedBy,
          votingRoundId,
          currentTime,
          nomination,
        );

        // Assert
        expect(message).toBe(
          `Nominating receiver for voting round with ID ${votingRoundId}, nominated by ${nominatedBy}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The nomination is: ${JSON.stringify(nomination)})`,
        );
      });
    });

    describe('REVEAL_RESULT_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const publisherAddress = Wallet.createRandom().address as Address;
        const votingRoundId = randomUUID();
        const currentTime = new Date();

        // Act
        const message = REVEAL_RESULT_MESSAGE_TEMPLATE(
          publisherAddress,
          votingRoundId,
          currentTime,
        );

        // Assert
        expect(message).toBe(
          `Reveal the result for voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`,
        );
      });
    });

    describe('VOTE_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const currentTime = new Date('2024-01-01T00:00:00Z');
        const voterAddress = '0xVoterAddress';
        const votingRoundId = 'votingRound123';

        const receivers = [
          { type: 'dripList', accountId: 'b', weight: 3 },
          { type: 'address', address: 'a', weight: 1 },
          { type: 'project', url: 'c', weight: 2 },
        ] as Receiver[];

        const expectedSortedReceivers = [
          ['address', 'a', 1],
          ['drip-list', 'b', 3],
          ['project', 'c', 2],
        ];

        const expectedMessage = `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(expectedSortedReceivers)}`;

        // Act
        const message = VOTE_MESSAGE_TEMPLATE(
          currentTime,
          voterAddress,
          votingRoundId,
          receivers,
        );

        // Assert
        expect(message).toEqual(expectedMessage);
      });
    });

    describe('DELETE_VOTING_ROUND_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const publisherAddress = Wallet.createRandom().address as Address;
        const votingRoundId = randomUUID();
        const currentTime = new Date();

        // Act
        const message = DELETE_VOTING_ROUND_MESSAGE_TEMPLATE(
          currentTime,
          publisherAddress,
          votingRoundId,
        );

        // Assert
        expect(message).toBe(
          `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`,
        );
      });
    });

    describe('START_VOTING_ROUND_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const currentTime = new Date();
        const publisherAddress = Wallet.createRandom().address as Address;
        const dripListId = 'dripListId' as DripListId;

        const expectedMessage = `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

        // Act
        const message = START_VOTING_ROUND_MESSAGE_TEMPLATE(
          currentTime,
          publisherAddress,
          dripListId,
        );

        // Assert
        expect(message).toEqual(expectedMessage);
      });
    });

    describe('CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE', () => {
      it('should return the expected message', () => {
        // Arrange
        const currentTime = new Date();
        const publisherAddress = Wallet.createRandom().address as Address;

        const expectedMessage = `Create a new collaborative Drip List owned by ${publisherAddress}, on chain ID ${appSettings.chainId}. The current time is ${currentTime.toISOString()}.`;

        // Act
        const message = CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(
          currentTime,
          publisherAddress,
        );

        // Assert
        expect(message).toEqual(expectedMessage);
      });
    });
  });
});
