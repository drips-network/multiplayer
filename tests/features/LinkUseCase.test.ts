import { randomUUID } from 'crypto';
import type { Logger } from 'winston';
import LinkUseCase from '../../src/features/link/LinkUseCase';
import { toDripListId, type DripListId } from '../../src/domain/typeUtils';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type ISafeService from '../../src/application/interfaces/ISafeService';
import type { SafeTx } from '../../src/domain/linkedDripList/Link';

jest.mock('../../src/domain/typeUtils');

describe('LinkUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundRepositoryMock = {
    getById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const safeServiceMock = {
    getSafeTransaction: jest.fn(),
  } as unknown as jest.Mocked<ISafeService>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should throw when the voting round does not exist', async () => {
      // Arrange
      votingRoundRepositoryMock.getById.mockResolvedValue(null);

      const useCase = new LinkUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        safeServiceMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId: randomUUID(),
          dripListId: 'dripListId' as DripListId,
          safeTransactionHash: undefined,
        });

      // Assert
      await expect(execute).rejects.toThrow('voting round not found.');
    });
  });

  it('should throw when safe transaction hash is provided without Drip List ID', async () => {
    // Arrange
    votingRoundRepositoryMock.getById.mockResolvedValue({} as VotingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      safeServiceMock,
    );

    // Act
    const execute = () =>
      useCase.execute({
        votingRoundId: randomUUID(),
        dripListId: undefined,
        safeTransactionHash: 'safeTransactionHash',
      });

    // Assert
    await expect(execute).rejects.toThrow(
      `Drip List ID is required when providing a safe transaction hash.`,
    );
  });

  it('should throw when voting round is not related to an existing Drip List and no Drip List ID is provided', async () => {
    // Arrange
    votingRoundRepositoryMock.getById.mockResolvedValue({} as VotingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      safeServiceMock,
    );

    // Act
    const execute = () =>
      useCase.execute({
        votingRoundId: randomUUID(),
        dripListId: undefined,
        safeTransactionHash: undefined,
      });

    // Assert
    await expect(execute).rejects.toThrow(
      'A Drip List ID is not set for the voting round and not provided in the request.',
    );
  });

  it('should throw when voting round is related to an existing Drip List and the provided Drip List ID is different', async () => {
    // Arrange
    votingRoundRepositoryMock.getById.mockResolvedValue({
      _dripListId: 'dripListId',
    } as VotingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      safeServiceMock,
    );

    // Act
    const execute = () =>
      useCase.execute({
        votingRoundId: randomUUID(),
        dripListId: 'anotherDripListId' as DripListId,
        safeTransactionHash: undefined,
      });

    // Assert
    await expect(execute).rejects.toThrow(
      'A Drip List ID is already set for this voting round and the provided Drip List ID does not match.',
    );
  });

  it('should link to Drip List', async () => {
    // Arrange
    const votingRoundId = randomUUID();
    const dripListId = toDripListId(
      '34625983682950977210847096367816372822461201185275535522726531049130',
    );
    const votingRound = {
      _id: votingRoundId,
      _dripListId: dripListId,
      linkToDripList: jest.fn(),
    } as unknown as VotingRound;

    votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      safeServiceMock,
    );

    const safeTx = {} as unknown as SafeTx;

    safeServiceMock.getSafeTransaction.mockResolvedValue(safeTx);

    const safeTransactionHash = 'safeTransactionHash';

    // Act
    await useCase.execute({
      votingRoundId,
      dripListId:
        '34625983682950977210847096367816372822461201185275535522726531049130' as DripListId,
      safeTransactionHash,
    });

    // Assert
    expect(votingRound.linkToDripList).toHaveBeenCalled();
    expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
    expect(safeServiceMock.getSafeTransaction).toHaveBeenCalledWith(
      safeTransactionHash,
    );
  });
});
