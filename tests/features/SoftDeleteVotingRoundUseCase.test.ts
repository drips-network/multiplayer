import type { Logger } from 'winston';
import { Wallet } from 'ethers';
import { randomUUID } from 'crypto';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import {
  DELETE_VOTING_ROUND_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type { Address } from '../../src/domain/typeUtils';
import SoftDeleteVotingRoundUseCase, {
  type SoftDeleteVotingRoundCommand,
} from '../../src/features/softDeleteVotingRound/SoftDeleteVotingVotingRoundUseCase';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';

jest.mock('../../src/application/Auth');

describe('SoftDeleteVotingRoundUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundRepositoryMock = {
    getById: jest.fn(),
    softRemove: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const authMock = {
    verifyMessage: jest.fn(),
  } as unknown as jest.Mocked<IAuthStrategy>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should throw when voting round is not found', async () => {
      // Arrange
      votingRoundRepositoryMock.getById.mockResolvedValue(null);

      const command: SoftDeleteVotingRoundCommand = {
        id: randomUUID(),
        date: new Date(),
        signature: 'signature',
        publisherAddress: Wallet.createRandom().address as Address,
      };

      const useCase = new SoftDeleteVotingRoundUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        authMock,
      );

      // Act
      const execute = () => useCase.execute(command);

      // Assert
      await expect(execute).rejects.toThrow('voting round not found.');
    });

    it('should verify signature', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const publisherAddress = Wallet.createRandom().address;
      const votingRound = {
        _id: votingRoundId,
        _publisher: {
          _address: publisherAddress,
        },
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: SoftDeleteVotingRoundCommand = {
        id: votingRoundId,
        date: new Date(),
        signature: 'signature',
        publisherAddress,
      };

      (DELETE_VOTING_ROUND_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue(
        'message',
      );

      const useCase = new SoftDeleteVotingRoundUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        authMock,
      );

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        votingRound._publisher._address,
        command.date,
      );
      expect(DELETE_VOTING_ROUND_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        command.date,
        command.publisherAddress as Address,
        votingRound._id,
      );
    });
  });
});
