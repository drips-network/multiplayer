import type { Logger } from 'winston';
import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import {
  REVEAL_VOTES_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type IReceiverMapper from '../../src/application/interfaces/IReceiverMapper';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import { VotingRoundStatus } from '../../src/domain/votingRoundAggregate/VotingRound';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import type { GetVotingRoundVotesCommand } from '../../src/features/getVotingRoundVotes/GetVotingRoundVotesUseCase';
import GetVotingRoundVotesUseCase from '../../src/features/getVotingRoundVotes/GetVotingRoundVotesUseCase';
import type Vote from '../../src/domain/votingRoundAggregate/Vote';
import type { Address } from '../../src/domain/typeUtils';

jest.mock('../../src/application/Auth');

describe('GetVotingRoundVotesUseCase', () => {
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
  const receiverMapperMock = {
    mapToReceiverDto: jest.fn(),
  } as unknown as jest.Mocked<IReceiverMapper>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should throw when the voting round does not exist', async () => {
      // Arrange
      votingRoundRepositoryMock.getById.mockResolvedValue(null);

      const useCase = new GetVotingRoundVotesUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        receiverMapperMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId: randomUUID(),
        } as unknown as GetVotingRoundVotesCommand);

      // Assert
      await expect(execute).rejects.toThrow('voting round not found.');
    });

    it('should throw when votes are private and auth is not provided', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _areVotesPrivate: true,
        status: VotingRoundStatus.Started,
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const useCase = new GetVotingRoundVotesUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        receiverMapperMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId,
        } as unknown as GetVotingRoundVotesCommand);

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
        getLatestVotes: jest.fn(),
      } as unknown as jest.Mocked<VotingRound>;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: GetVotingRoundVotesCommand = {
        votingRoundId,
        date: new Date().toISOString(),
        signature: 'signature',
      };

      const useCase = new GetVotingRoundVotesUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        receiverMapperMock,
        authMock,
      );

      (REVEAL_VOTES_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      votingRound.getLatestVotes.mockReturnValue([]);

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        votingRound._publisher._address,
        new Date(command.date!),
      );
      expect(REVEAL_VOTES_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        votingRound._publisher._address,
        votingRoundId,
        new Date(command.date!),
      );
    });

    it('should return the votes', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _areVotesPrivate: true,
        status: VotingRoundStatus.Linked,
        _publisher: {
          _address: Wallet.createRandom().address,
        },
        getLatestVotes: jest.fn(),
      } as unknown as jest.Mocked<VotingRound>;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: GetVotingRoundVotesCommand = {
        votingRoundId,
        date: new Date().toISOString(),
        signature: 'signature',
      };

      const useCase = new GetVotingRoundVotesUseCase(
        votingRoundRepositoryMock,
        loggerMock,
        receiverMapperMock,
        authMock,
      );

      (REVEAL_VOTES_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      const receiver: Receiver = {
        _accountId: 'accountId',
      } as unknown as Receiver;

      const expectedResult = [
        {
          collaborator: Wallet.createRandom().address,
          latestVote: {
            receivers: [receiver],
          },
        },
      ] as {
        collaborator: Address;
        latestVote: Vote | null;
      }[];

      receiverMapperMock.mapToReceiverDto.mockReturnValue({
        _accountId: 'mappedAccountId',
      } as unknown as Receiver);

      votingRound.getLatestVotes.mockReturnValue(expectedResult);

      // Act
      const result = await useCase.execute(command);

      // Assert
      expect(votingRound.getLatestVotes).toHaveBeenCalled();
      expect(result.votes).toEqual(
        expectedResult.map((collaboratorsWithVotes) => ({
          collaboratorAddress: collaboratorsWithVotes.collaborator,
          latestVote:
            collaboratorsWithVotes.latestVote?.receivers?.map((r) =>
              receiverMapperMock.mapToReceiverDto(r),
            ) || null,
        })),
      );
    });
  });
});
