import { randomUUID } from 'crypto';
import type { Logger } from 'winston';
import LinkUseCase from '../../src/features/link/LinkUseCase';
import { toDripListId, type DripListId } from '../../src/domain/typeUtils';
import type { IAuthStrategy } from '../../src/application/Auth';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';

jest.mock('../../src/application/Auth');
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
  const authMock = {
    verifyMessage: jest.fn(),
    verifyDripListOwnership: jest.fn(),
  } as unknown as jest.Mocked<IAuthStrategy>;

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
        authMock,
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

  it('should throw when the voting round is already linked to a DripList', async () => {
    // Arrange
    votingRoundRepositoryMock.getById.mockResolvedValue({
      _dripListId: 'dripListId',
    } as VotingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      authMock,
    );

    // Act
    const execute = () =>
      useCase.execute({
        votingRoundId: randomUUID(),
        dripListId: 'dripListId' as DripListId,
        safeTransactionHash: undefined,
      });

    // Assert
    await expect(execute).rejects.toThrow(
      'Voting round already connected to a DripList. Do not provide a Drip List ID for an existing Drip List.',
    );
  });

  it('should throw when voting round is not related to an existing Drip List and no Drip List ID is provided', async () => {
    // Arrange
    votingRoundRepositoryMock.getById.mockResolvedValue({} as VotingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      authMock,
    );

    // Act
    const execute = () =>
      useCase.execute({
        votingRoundId: randomUUID(),
        dripListId: undefined,
        safeTransactionHash: undefined,
      });

    // Assert
    await expect(execute).rejects.toThrow('Missing Drip List ID.');
  });

  it('should link to existing Drip List', async () => {
    // Arrange
    const votingRoundId = randomUUID();
    const dripListId = 'dripListId' as DripListId;
    const votingRound = {
      _id: votingRoundId,
      _dripListId: dripListId,
      linkToExistingDripList: jest.fn(),
    } as unknown as VotingRound;

    votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      authMock,
    );

    // Act
    await useCase.execute({
      votingRoundId,
      dripListId: undefined,
      safeTransactionHash: undefined,
    });

    // Assert
    expect(authMock.verifyDripListOwnership).toHaveBeenCalledWith(
      votingRound,
      votingRound._dripListId,
    );
    expect(votingRound.linkToExistingDripList).toHaveBeenCalled();
    expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
  });

  it('should link to a new Drip List', async () => {
    // Arrange
    const votingRoundId = randomUUID();
    const dripListId = 'dripListId' as DripListId;
    const votingRound = {
      _id: votingRoundId,
      _dripListId: undefined,
      linkToNewDripList: jest.fn(),
    } as unknown as VotingRound;

    votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

    const useCase = new LinkUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      authMock,
    );

    (toDripListId as jest.Mock).mockReturnValue(dripListId);

    // Act
    await useCase.execute({
      votingRoundId,
      dripListId,
      safeTransactionHash: 'safeTransactionHash',
    });

    // Assertnk
    expect(authMock.verifyDripListOwnership).toHaveBeenCalledWith(
      votingRound,
      toDripListId(dripListId),
    );
    expect(votingRound.linkToNewDripList).toHaveBeenCalled();
    expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
  });
});
