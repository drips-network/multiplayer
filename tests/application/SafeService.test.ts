import type { Logger } from 'winston';
import type { GraphQLClient } from 'graphql-request';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type { IAuthStrategy } from '../../src/application/Auth';
import SafeService from '../../src/application/SafeService';
import type { SafeAdapter } from '../../src/application/SafeAdapter';

jest.mock('@safe-global/protocol-kit');

describe('SafeService', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundRepositoryMock = {
    getById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const authMock = {
    verifyDripListOwnership: jest.fn(),
  } as unknown as jest.Mocked<IAuthStrategy>;
  const graphqlClientMock = {
    request: jest.fn(),
  } as unknown as jest.Mocked<GraphQLClient>;
  const safeAdapterMock = {
    getTransaction: jest.fn(),
  } as unknown as jest.Mocked<SafeAdapter>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getSafeTransaction', () => {
    it('should throw when transaction was executed but not successful', async () => {
      // Arrange
      safeAdapterMock.getTransaction.mockResolvedValue({
        safe: 'safe',
        isExecuted: true,
        isSuccessful: false,
      } as any);

      const safeService = new SafeService(
        graphqlClientMock,
        authMock,
        votingRoundRepositoryMock,
        safeAdapterMock,
        loggerMock,
      );

      // Act
      const getSafeTransaction = () =>
        safeService.getSafeTransaction('safeTransactionHash');

      // Assert
      await expect(getSafeTransaction()).rejects.toThrow(
        'Safe transaction was executed but not successful. Link will never be completed.',
      );
    });

    it('should return safe transaction', async () => {
      // Arrange
      safeAdapterMock.getTransaction.mockResolvedValue({
        safe: 'safe',
        isExecuted: false,
        isSuccessful: undefined,
      } as any);

      const safeService = new SafeService(
        graphqlClientMock,
        authMock,
        votingRoundRepositoryMock,
        safeAdapterMock,
        loggerMock,
      );

      // Act
      const result = await safeService.getSafeTransaction(
        'safeTransactionHash',
      );

      // Assert
      expect(result).toEqual({
        safeAddress: 'safe',
        transactionHash: 'safeTransactionHash',
        isExecuted: false,
        isSuccessful: undefined,
      });
    });
  });

  describe('checkSafeTxAndLinkPending', () => {
    it('should throw when safe transaction does not belong to the voting round publisher', async () => {
      // Arrange
      const votingRound = {
        _link: {
          _safeTransactionHash: 'safeTransactionHash',
        },
        _dripListId: 'dripListId',
        publisherAddress: 'publisherAddress',
      } as any;
      safeAdapterMock.getTransaction.mockResolvedValue({
        safe: 'safe',
        isExecuted: false,
        isSuccessful: undefined,
      } as any);

      const safeService = new SafeService(
        graphqlClientMock,
        authMock,
        votingRoundRepositoryMock,
        safeAdapterMock,
        loggerMock,
      );

      // Act
      const checkSafeTxAndLinkPending = () =>
        safeService.checkSafeTxAndLinkPending(votingRound as any);

      // Assert
      await expect(checkSafeTxAndLinkPending()).rejects.toThrow(
        'Error while trying to complete link: Safe transaction does not belong to the voting round publisher.',
      );
    });

    it('should complete link', async () => {
      // Arrange
      const votingRound = {
        _link: {
          _safeTransactionHash: 'safeTransactionHash',
          _isSafeTransactionExecuted: false,
          markSafeTransactionAsExecuted: jest.fn(),
        },
        _dripListId: 'dripListId',
        publisherAddress: 'publisherAddress',
        _id: 'votingRoundId',
      } as any;
      safeAdapterMock.getTransaction.mockResolvedValue({
        safe: 'publisherAddress',
        isExecuted: true,
        isSuccessful: true,
      } as any);
      graphqlClientMock.request.mockResolvedValue({
        dripList: {
          dripList: 'dripListId',
        },
      });

      const safeService = new SafeService(
        graphqlClientMock,
        authMock,
        votingRoundRepositoryMock,
        safeAdapterMock,
        loggerMock,
      );

      // Act
      await safeService.checkSafeTxAndLinkPending(votingRound as any);

      // Assert
      expect(
        votingRound._link.markSafeTransactionAsExecuted,
      ).toHaveBeenCalled();
      expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
    });
  });
});
