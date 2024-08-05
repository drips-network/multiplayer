import { Wallet } from 'ethers';
import type Collaborator from '../../src/domain/collaboratorAggregate/Collaborator';
import type ICollaboratorRepository from '../../src/domain/collaboratorAggregate/ICollaboratorRepository';
import type IPublisherRepository from '../../src/domain/publisherAggregate/IPublisherRepository';
import type Publisher from '../../src/domain/publisherAggregate/Publisher';
import VotingRoundService from '../../src/domain/services/VotingRoundService';
import type { DripListId } from '../../src/domain/typeUtils';
import type IVotingRoundRepository from '../../src/domain/votingRoundAggregate/IVotingRoundRepository';
import VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';
import type IAllowedReceiversRepository from '../../src/domain/allowedReceiver/IAllowedReceiversRepository';
import type { AllowedReceiverData } from '../../src/domain/allowedReceiver/AllowedReceiver';

jest.mock('../../src/domain/votingRoundAggregate/VotingRound');

describe('VotingRoundService', () => {
  const votingRoundRepositoryMock = {
    getActiveVotingRoundsByPublisher: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<IVotingRoundRepository>;
  const collaboratorRepositoryMock = {
    getManyByAddresses: jest.fn(),
    createMany: jest.fn(),
  } as unknown as jest.Mocked<ICollaboratorRepository>;
  const publisherRepositoryMock = {
    getById: jest.fn(),
    getByAddress: jest.fn(),
  } as unknown as jest.Mocked<IPublisherRepository>;
  const allowedReceiversRepositoryMock = {
    createMany: jest.fn(),
  } as unknown as jest.Mocked<IAllowedReceiversRepository>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('start', () => {
    it('should throw when the publisher already has an active voting round for this existing Drip List', async () => {
      // Arrange
      const dripListId =
        '42583592044554662154154760653976070706375843797872425666273362826761' as DripListId;

      votingRoundRepositoryMock.getActiveVotingRoundsByPublisher.mockResolvedValue(
        [
          {
            _dripListId: dripListId,
          } as unknown as VotingRound,
        ],
      );

      const service = new VotingRoundService(
        publisherRepositoryMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
        allowedReceiversRepositoryMock,
      );

      // Act
      const start = () =>
        service.start(
          new Date(),
          new Date(),
          {
            _address: Wallet.createRandom().address,
          } as unknown as Publisher,
          dripListId as DripListId,
          'name',
          'description',
          [{ _address: Wallet.createRandom().address } as Collaborator],
          true,
        );

      // Assert
      await expect(start).rejects.toThrow(
        'Publisher already has an active voting round for this existing Drip List.',
      );
    });

    it('should create new collaborators', async () => {
      // Arrange
      const collaborators = [
        {
          _address: Wallet.createRandom().address,
        },
        {
          _address: Wallet.createRandom().address,
        },
      ] as Collaborator[];

      collaboratorRepositoryMock.getManyByAddresses.mockResolvedValue([
        collaborators[0],
      ]);

      votingRoundRepositoryMock.getActiveVotingRoundsByPublisher.mockResolvedValue(
        [],
      );

      const service = new VotingRoundService(
        publisherRepositoryMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
        allowedReceiversRepositoryMock,
      );

      (VotingRound.create as jest.Mock).mockReturnValue({
        _id: 'newVotingRoundId',
      });

      // Act
      await service.start(
        new Date(),
        new Date(),
        {
          _address: Wallet.createRandom().address,
        } as unknown as Publisher,
        undefined,
        'name',
        'description',
        collaborators,
        true,
      );

      // Assert
      expect(collaboratorRepositoryMock.createMany).toHaveBeenCalledWith([
        {
          _address: collaborators[1]._address,
        },
      ]);
    });

    it('should start a voting round', async () => {
      // Arrange
      const collaborators = [
        {
          _address: Wallet.createRandom().address,
        },
      ] as Collaborator[];

      collaboratorRepositoryMock.getManyByAddresses.mockResolvedValue([]);

      votingRoundRepositoryMock.getActiveVotingRoundsByPublisher.mockResolvedValue(
        [],
      );

      const service = new VotingRoundService(
        publisherRepositoryMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
        allowedReceiversRepositoryMock,
      );

      (VotingRound.create as jest.Mock).mockReturnValue({
        _id: 'newVotingRoundId',
      });

      // Act
      const result = await service.start(
        new Date(),
        new Date(),
        {
          _address: Wallet.createRandom().address,
        } as unknown as Publisher,
        undefined,
        'name',
        'description',
        collaborators,
        true,
      );

      // Assert
      expect(votingRoundRepositoryMock.save).toHaveBeenCalled();
      expect(result._id).toBe('newVotingRoundId');
    });

    it('should set allowed receivers if specified', async () => {
      // Arrange
      const collaborators = [
        {
          _address: Wallet.createRandom().address,
        },
      ] as Collaborator[];

      collaboratorRepositoryMock.getManyByAddresses.mockResolvedValue([]);

      votingRoundRepositoryMock.getActiveVotingRoundsByPublisher.mockResolvedValue(
        [],
      );

      const service = new VotingRoundService(
        publisherRepositoryMock,
        votingRoundRepositoryMock,
        collaboratorRepositoryMock,
        allowedReceiversRepositoryMock,
      );

      (VotingRound.create as jest.Mock).mockReturnValue({
        _id: 'newVotingRoundId',
      });

      const allowedReceiversData = [
        {
          address: Wallet.createRandom().address,
          accountId: '1',
          type: 'address',
        } as AllowedReceiverData,
      ];

      // Act
      await service.start(
        new Date(),
        new Date(),
        {
          _address: Wallet.createRandom().address,
        } as unknown as Publisher,
        undefined,
        'name',
        'description',
        collaborators,
        true,
        undefined,
        undefined,
        allowedReceiversData,
      );

      // Assert
      expect(allowedReceiversRepositoryMock.createMany).toHaveBeenCalled();
      expect(votingRoundRepositoryMock.save).toHaveBeenCalledTimes(2);
    });
  });
});
