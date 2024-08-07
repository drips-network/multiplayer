import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import type { Logger } from 'winston';
import type { CastVoteCommand } from '../../src/features/castVote/CastVoteUseCase';
import CastVoteUseCase from '../../src/features/castVote/CastVoteUseCase';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type IReceiverMapper from '../../src/application/interfaces/IReceiverMapper';
import {
  VOTE_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import { yesterday } from '../testUtils';
import type { Address } from '../../src/domain/typeUtils';

jest.mock('../../src/application/Auth');

describe('CastVoteUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundRepositoryMock = {
    getById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const receiverMapperMock = {
    mapToReceiver: jest.fn(),
  } as unknown as jest.Mocked<IReceiverMapper>;
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

      const useCase = new CastVoteUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId: randomUUID(),
          receivers: [],
          signature: 'signature',
          date: new Date(),
          collaboratorAddress: 'collaboratorAddress',
        });

      // Assert
      await expect(execute).rejects.toThrow('voting round not found.');
    });

    it('should throw when collaborator is not found', async () => {
      // Arrange
      const votingRoundId = randomUUID();

      votingRoundRepositoryMock.getById.mockResolvedValue({
        _id: votingRoundId,
        _collaborators: [],
      } as unknown as VotingRound);

      const useCase = new CastVoteUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId,
          receivers: [],
          signature: 'signature',
          date: new Date(),
          collaboratorAddress: Wallet.createRandom().address,
        });

      // Assert
      await expect(execute).rejects.toThrow('Collaborator not found.');
    });

    it('should verify signature', async () => {
      // Arrange
      const votingRoundId = randomUUID();

      const collaborator = Wallet.createRandom().address as Address;
      votingRoundRepositoryMock.getById.mockResolvedValue({
        _id: votingRoundId,
        _collaborators: [collaborator],
        castVote: jest.fn(),
      } as unknown as VotingRound);

      const useCase = new CastVoteUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
        authMock,
      );

      const receiverEntity = {} as unknown as Receiver;
      receiverMapperMock.mapToReceiver.mockResolvedValue(receiverEntity);

      const command: CastVoteCommand = {
        votingRoundId,
        receivers: [{} as unknown as Receiver],
        signature: 'signature',
        date: yesterday,
        collaboratorAddress: collaborator,
      };

      (VOTE_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        command.collaboratorAddress,
        command.date,
      );
      expect(VOTE_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        command.date,
        command.collaboratorAddress,
        command.votingRoundId,
        [receiverEntity],
      );
    });
  });

  it('should throw when trying to cast an outdated vote', async () => {
    // Arrange
    const votingRoundId = randomUUID();

    const collaborator = Wallet.createRandom().address as Address;

    votingRoundRepositoryMock.getById.mockResolvedValue({
      _id: votingRoundId,
      _collaborators: [collaborator],
      _votes: [
        {
          _votingRound: { _id: votingRoundId },
          _collaborator: collaborator,
          _updatedAt: new Date(),
        },
      ],
      castVote: jest.fn(),
    } as unknown as VotingRound);

    const useCase = new CastVoteUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      receiverMapperMock,
      authMock,
    );

    const command: CastVoteCommand = {
      votingRoundId,
      receivers: [],
      signature: 'signature',
      date: yesterday,
      collaboratorAddress: collaborator,
    };

    // Act
    const execute = () => useCase.execute(command);

    // Assert
    await expect(execute).rejects.toThrow('Vote already casted.');
  });

  it('should cast vote', async () => {
    // Arrange
    const votingRoundId = randomUUID();

    const collaborator = Wallet.createRandom().address as Address;

    const votingRound = {
      _id: votingRoundId,
      _collaborators: [collaborator],
      castVote: jest.fn(),
    } as unknown as VotingRound;

    votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

    const receiverEntity = {} as unknown as Receiver;
    receiverMapperMock.mapToReceiver.mockResolvedValue(receiverEntity);

    const useCase = new CastVoteUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      receiverMapperMock,
      authMock,
    );

    const command: CastVoteCommand = {
      votingRoundId,
      receivers: [{} as unknown as Receiver],
      signature: 'signature',
      date: yesterday,
      collaboratorAddress: collaborator,
    };

    // Act
    await useCase.execute(command);

    // Assert
    expect(votingRound.castVote).toHaveBeenCalledWith(collaborator, [
      receiverEntity,
    ]);
    expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
  });
});
