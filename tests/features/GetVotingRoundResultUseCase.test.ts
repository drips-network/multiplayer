import type { Logger } from 'winston';
import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import {
  REVEAL_RESULT_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type { GetVotingRoundResultCommand } from '../../src/features/getVotingRoundResult/GetVotingRoundResultUseCase';
import GetVotingRoundResultUseCase from '../../src/features/getVotingRoundResult/GetVotingRoundResultUseCase';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import { VotingRoundStatus } from '../../src/domain/votingRoundAggregate/VotingRound';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';

jest.mock('../../src/application/Auth');

describe('GetVotingRoundResultUseCase', () => {
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
  } as unknown as jest.Mocked<IAuthStrategy>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should throw when the voting round does not exist', async () => {
      // Arrange
      votingRoundRepositoryMock.getById.mockResolvedValue(null);

      const useCase = new GetVotingRoundResultUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId: randomUUID(),
        } as unknown as GetVotingRoundResultCommand);

      // Assert
      await expect(execute).rejects.toThrow('voting round not found.');
    });

    it('should throw when votes are private, status is not completed and auth is not provided', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _areVotesPrivate: true,
        status: VotingRoundStatus.Started,
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const useCase = new GetVotingRoundResultUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId,
        } as unknown as GetVotingRoundResultCommand);

      // Assert
      await expect(execute).rejects.toThrow(
        'Authentication is required for private voting rounds.',
      );
    });

    it('should verify signature when votes are private', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _areVotesPrivate: true,
        status: VotingRoundStatus.Linked,
        _publisher: {
          _address: Wallet.createRandom().address,
        },
        _chainId: 1,
        getResult: jest.fn(),
      } as unknown as jest.Mocked<VotingRound>;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: GetVotingRoundResultCommand = {
        votingRoundId,
        date: new Date().toISOString(),
        signature: 'signature',
      };

      const useCase = new GetVotingRoundResultUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        authMock,
      );

      (REVEAL_RESULT_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      votingRound.getResult.mockReturnValue([]);

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        votingRound._publisher._address,
        new Date(command.date!),
        votingRound._chainId,
      );
      expect(REVEAL_RESULT_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        votingRound._publisher._address,
        votingRoundId,
        new Date(command.date!),
        votingRound._chainId,
      );
    });

    it('should return the results', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _areVotesPrivate: true,
        status: VotingRoundStatus.Linked,
        _publisher: {
          _address: Wallet.createRandom().address,
        },
        getResult: jest.fn(),
      } as unknown as jest.Mocked<VotingRound>;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: GetVotingRoundResultCommand = {
        votingRoundId,
        date: new Date().toISOString(),
        signature: 'signature',
      };

      const useCase = new GetVotingRoundResultUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        authMock,
      );

      (REVEAL_RESULT_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      const expectedResult: Receiver[] = [];

      votingRound.getResult.mockReturnValue(expectedResult);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(votingRound.getResult).toHaveBeenCalled();
      expect(result).toEqual({ result: expectedResult });
    });
  });
});
