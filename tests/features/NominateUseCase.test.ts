import type { Logger } from 'winston';
import { randomUUID } from 'crypto';
import { Wallet } from 'ethers';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import type IReceiverMapper from '../../src/application/interfaces/IReceiverMapper';
import {
  NOMINATE_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type { NominateCommand } from '../../src/features/nominate/NominateUseCase';
import NominateUseCase from '../../src/features/nominate/NominateUseCase';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type { NominationReceiver } from '../../src/domain/votingRoundAggregate/Nomination';
import type { Address } from '../../src/domain/typeUtils';
import Nomination from '../../src/domain/votingRoundAggregate/Nomination';

jest.mock('../../src/application/Auth');
jest.mock('../../src/domain/votingRoundAggregate/Nomination');

describe('NominateUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundRepositoryMock = {
    getById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const receiverMapperMock = {
    mapToNominationReceiver: jest.fn(),
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

      const command: NominateCommand = {
        votingRoundId: randomUUID(),
        date: new Date(),
        signature: 'signature',
        nominatedBy: 'nominatedBy',
        description: 'description',
        impactMetrics: [
          {
            key: 'value',
          },
        ],
        nomination: {
          address: 'address',
          type: 'address',
        },
      };

      const useCase = new NominateUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
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
      const votingRound = {
        _id: votingRoundId,
        _publisher: {
          _address: 'publisherAddress',
        },
        nominate: jest.fn(),
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const receiver = {
        accountId: 'accountId',
      } as NominationReceiver;

      receiverMapperMock.mapToNominationReceiver.mockResolvedValue(receiver);

      const command: NominateCommand = {
        votingRoundId,
        date: new Date(),
        signature: 'signature',
        nominatedBy: Wallet.createRandom().address,
        description: 'description',
        impactMetrics: [
          {
            key: 'value',
          },
        ],
        nomination: {
          address: 'address',
          type: 'address',
        },
      };

      const useCase = new NominateUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
        authMock,
      );

      const nomination = { _id: randomUUID() } as Nomination;
      Nomination.create = jest.fn().mockReturnValue(nomination);

      (NOMINATE_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue('message');

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        votingRound._publisher._address,
        command.date,
      );
      expect(NOMINATE_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        command.nominatedBy as Address,
        command.votingRoundId,
        command.date,
        receiver,
      );
    });

    it('should nominate', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _publisher: {
          _address: 'publisherAddress',
        },
        nominate: jest.fn(),
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const receiver = {
        accountId: 'accountId',
      } as NominationReceiver;

      receiverMapperMock.mapToNominationReceiver.mockResolvedValue(receiver);

      const command: NominateCommand = {
        votingRoundId,
        date: new Date(),
        signature: 'signature',
        nominatedBy: Wallet.createRandom().address,
        description: 'description',
        impactMetrics: [
          {
            key: 'value',
          },
        ],
        nomination: {
          address: 'address',
          type: 'address',
        },
      };

      const nomination = { _id: randomUUID() } as Nomination;
      Nomination.create = jest.fn().mockReturnValue(nomination);

      const useCase = new NominateUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        receiverMapperMock,
        authMock,
      );

      // Act
      await useCase.execute(command);

      // Assert
      expect(votingRound.nominate).toHaveBeenCalledWith(nomination);
      expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
    });
  });
});
