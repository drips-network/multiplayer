import type { Logger } from 'winston';
import { randomUUID } from 'crypto';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import {
  SET_NOMINATION_STATUS_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type { SetNominationsStatusesCommand } from '../../src/features/setNominationsStatuses/SetNominationsStatusesUseCase';
import SetNominationsStatusesUseCase from '../../src/features/setNominationsStatuses/SetNominationsStatusesUseCase';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import { NominationStatus } from '../../src/domain/votingRoundAggregate/Nomination';
import { toAccountId } from '../../src/domain/typeUtils';

jest.mock('../../src/application/Auth');

describe('SetNominationStatusesUseCase', () => {
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

      const useCase = new SetNominationsStatusesUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        authMock,
      );

      // Act
      const execute = () =>
        useCase.execute({
          votingRoundId: randomUUID(),
        } as unknown as SetNominationsStatusesCommand);

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
        _chainId: 1,
        setNominationsStatuses: jest.fn(),
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: SetNominationsStatusesCommand = {
        votingRoundId,
        date: new Date(),
        signature: 'signature',
        nominations: [
          {
            accountId: toAccountId(
              '42583592044554662154154760653976070706375843797872425666273362826761',
            ),
            status: NominationStatus.Accepted,
          },
        ],
      };

      const useCase = new SetNominationsStatusesUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        authMock,
      );

      (SET_NOMINATION_STATUS_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue(
        'message',
      );

      // Act
      await useCase.execute(command);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        command.signature,
        votingRound._publisher._address,
        command.date,
        votingRound._chainId,
      );
      expect(SET_NOMINATION_STATUS_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        votingRound._publisher._address,
        votingRoundId,
        command.date,
        command.nominations,
        votingRound._chainId,
      );
    });

    it('should set nomination statuses', async () => {
      // Arrange
      const votingRoundId = randomUUID();
      const votingRound = {
        _id: votingRoundId,
        _publisher: {
          _address: 'publisherAddress',
        },
        setNominationsStatuses: jest.fn(),
      } as unknown as VotingRound;
      votingRoundRepositoryMock.getById.mockResolvedValue(votingRound);

      const command: SetNominationsStatusesCommand = {
        votingRoundId,
        date: new Date(),
        signature: 'signature',
        nominations: [
          {
            accountId: toAccountId(
              '42583592044554662154154760653976070706375843797872425666273362826761',
            ),
            status: NominationStatus.Accepted,
          },
        ],
      };

      const useCase = new SetNominationsStatusesUseCase(
        loggerMock,
        votingRoundRepositoryMock,
        authMock,
      );

      // Act
      await useCase.execute(command);

      // Assert
      expect(votingRound.setNominationsStatuses).toHaveBeenCalledWith(
        command.nominations,
      );
      expect(votingRoundRepositoryMock.save).toHaveBeenCalledWith(votingRound);
    });
  });
});
