import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import type { Logger } from 'winston';
import type { CastVoteCommand } from '../../src/features/castVote/CastVoteUseCase';
import CastVoteUseCase from '../../src/features/castVote/CastVoteUseCase';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type ICollaboratorRepository from '../../src/domain/collaboratorAggregate/ICollaboratorRepository';
import type IReceiverMapper from '../../src/application/interfaces/IReceiverMapper';
import {
  VOTE_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type Collaborator from '../../src/domain/collaboratorAggregate/Collaborator';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import { yesterday } from '../testUtils';

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
  const collaboratorRepositoryMock = {
    getById: jest.fn(),
    getByAddress: jest.fn(),
  } as unknown as jest.Mocked<ICollaboratorRepository>;
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
        collaboratorRepositoryMock,
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
      } as unknown as VotingRound);

      collaboratorRepositoryMock.getByAddress.mockResolvedValue(null);

      const useCase = new CastVoteUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
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
      await expect(execute).rejects.toThrow('collaborator not found.');
    });

    it('should verify message', async () => {
      // Arrange
      const votingRoundId = randomUUID();

      votingRoundRepositoryMock.getById.mockResolvedValue({
        _id: votingRoundId,
        castVote: jest.fn(),
      } as unknown as VotingRound);

      collaboratorRepositoryMock.getByAddress.mockResolvedValue({
        _address: Wallet.createRandom().address,
      } as unknown as Collaborator);

      const useCase = new CastVoteUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
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
        collaboratorAddress: Wallet.createRandom().address,
      };

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        VOTE_MESSAGE_TEMPLATE(
          command.date,
          command.collaboratorAddress,
          command.votingRoundId,
          [receiverEntity],
        ),
        command.signature,
        command.collaboratorAddress,
        command.date,
      );
    });
  });

  it('should throw when trying to cast an outdated vote', async () => {
    // Arrange
    const votingRoundId = randomUUID();
    const voteId = randomUUID();

    collaboratorRepositoryMock.getByAddress.mockResolvedValue({
      _address: Wallet.createRandom().address,
      _votes: [
        {
          _id: voteId,
          _updatedAt: new Date(),
          _votingRound: { _id: votingRoundId },
        },
      ],
    } as unknown as Collaborator);

    votingRoundRepositoryMock.getById.mockResolvedValue({
      _id: votingRoundId,
      castVote: jest.fn(),
    } as unknown as VotingRound);

    const useCase = new CastVoteUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      collaboratorRepositoryMock,
      receiverMapperMock,
      authMock,
    );

    const command: CastVoteCommand = {
      votingRoundId,
      receivers: [],
      signature: 'signature',
      date: yesterday,
      collaboratorAddress: Wallet.createRandom().address,
    };

    // Act
    const execute = () => useCase.execute(command);

    // Assert
    await expect(execute).rejects.toThrow('Vote already casted.');
  });

  it('should cast vote', async () => {
    // Arrange
    const votingRoundId = randomUUID();
    const voteId = randomUUID();

    const collaborator = {
      _address: Wallet.createRandom().address,
      _votes: [
        {
          _id: voteId,
          _updatedAt: new Date(),
          _votingRound: { _id: randomUUID() },
        },
      ],
    } as unknown as Collaborator;

    collaboratorRepositoryMock.getByAddress.mockResolvedValue(collaborator);

    const votingRound = {
      _id: votingRoundId,
      castVote: jest.fn(),
    } as unknown as VotingRound;

    votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

    const receiverEntity = {} as unknown as Receiver;
    receiverMapperMock.mapToReceiver.mockResolvedValue(receiverEntity);

    const useCase = new CastVoteUseCase(
      loggerMock,
      votingRoundRepositoryMock,
      collaboratorRepositoryMock,
      receiverMapperMock,
      authMock,
    );

    const command: CastVoteCommand = {
      votingRoundId,
      receivers: [{} as unknown as Receiver],
      signature: 'signature',
      date: yesterday,
      collaboratorAddress: Wallet.createRandom().address,
    };

    // Act
    await useCase.execute(command);

    // Assert
    expect(votingRound.castVote).toHaveBeenCalledWith(collaborator, [
      receiverEntity,
    ]);
  });
});
