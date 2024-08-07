import type { Logger } from 'winston';
import { Wallet, getAddress } from 'ethers';
import type VotingRoundService from '../../src/domain/services/VotingRoundService';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
  type IAuthStrategy,
} from '../../src/application/Auth';
import type { StartVotingRoundRequest } from '../../src/features/startVotingRound/StartVotingRoundRequest';
import StartVotingRoundUseCase from '../../src/features/startVotingRound/StartVotingRoundUseCase';
import type { AccountId, Address } from '../../src/domain/typeUtils';
import Publisher from '../../src/domain/publisherAggregate/Publisher';
import type IReceiverMapper from '../../src/application/interfaces/IReceiverMapper';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';

jest.mock('../../src/application/Auth');

describe('StartVotingRoundUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<Logger>;
  const votingRoundServiceMock = {
    start: jest.fn(),
  } as unknown as jest.Mocked<VotingRoundService>;
  const authMock = {
    verifyMessage: jest.fn(),
  } as unknown as jest.Mocked<IAuthStrategy>;
  const receiverMapperMock = {
    mapToAllowedReceiver: jest.fn(),
  } as unknown as jest.Mocked<IReceiverMapper>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should verify signature for an existing Drip List', async () => {
      // Arrange
      const useCase = new StartVotingRoundUseCase(
        loggerMock,
        votingRoundServiceMock,
        authMock,
        receiverMapperMock,
      );

      votingRoundServiceMock.start.mockResolvedValueOnce({
        _id: 'newVotingRoundId',
      } as unknown as VotingRound);

      const request: StartVotingRoundRequest = {
        schedule: {
          voting: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
          nomination: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
        },
        publisherAddress: Wallet.createRandom().address,
        collaborators: [Wallet.createRandom().address],
        signature: 'signature',
        date: new Date(),
        areVotesPrivate: false,
        dripListId:
          '42583592044554662154154760653976070706375843797872425666273362826761',
      };

      (START_VOTING_ROUND_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue(
        'message',
      );

      // Act
      await useCase.execute(request);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        request.signature,
        request.publisherAddress,
        request.date,
      );
      expect(START_VOTING_ROUND_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        request.date,
        request.publisherAddress,
        request.dripListId,
      );
    });

    it('should verify signature for a new Drip List', async () => {
      // Arrange
      const useCase = new StartVotingRoundUseCase(
        loggerMock,
        votingRoundServiceMock,
        authMock,
        receiverMapperMock,
      );

      const request: StartVotingRoundRequest = {
        schedule: {
          voting: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
          nomination: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
        },
        publisherAddress: Wallet.createRandom().address,
        collaborators: [Wallet.createRandom().address],
        signature: 'signature',
        date: new Date(),
        areVotesPrivate: false,
        name: 'name',
        description: 'description',
      };

      votingRoundServiceMock.start.mockResolvedValueOnce({
        _id: 'newVotingRoundId',
      } as unknown as VotingRound);

      (CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE as jest.Mock).mockReturnValue(
        'message',
      );

      // Act
      await useCase.execute(request);

      // Assert
      expect(authMock.verifyMessage).toHaveBeenCalledWith(
        'message',
        request.signature,
        request.publisherAddress,
        request.date,
      );
      expect(CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE).toHaveBeenCalledWith(
        request.date,
        request.publisherAddress,
      );
    });

    it('should start a new Voting Round', async () => {
      // Arrange
      const useCase = new StartVotingRoundUseCase(
        loggerMock,
        votingRoundServiceMock,
        authMock,
        receiverMapperMock,
      );

      const receiverData = {
        address: Wallet.createRandom().address,
        type: 'address' as const,
        accountId: '1' as AccountId,
      };

      receiverMapperMock.mapToAllowedReceiver.mockResolvedValueOnce(
        receiverData,
      );

      votingRoundServiceMock.start.mockResolvedValueOnce({
        _id: 'newVotingRoundId',
      } as unknown as VotingRound);

      const request: StartVotingRoundRequest = {
        schedule: {
          voting: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
          nomination: {
            startsAt: new Date(),
            endsAt: new Date(),
          },
        },
        publisherAddress: Wallet.createRandom().address,
        collaborators: [Wallet.createRandom().address],
        signature: 'signature',
        date: new Date(),
        areVotesPrivate: false,
        name: 'name',
        description: 'description',
        allowedReceivers: [
          {
            address: Wallet.createRandom().address,
            type: 'address',
          },
        ],
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(votingRoundServiceMock.start).toHaveBeenCalledWith(
        request.schedule.voting.startsAt,
        request.schedule.voting.endsAt,
        Publisher.create(request.publisherAddress),
        undefined,
        (request as any).name,
        (request as any).description,
        request.collaborators.map((c) => getAddress(c) as Address),
        request.areVotesPrivate,
        request.schedule.nomination!.startsAt,
        request.schedule.nomination!.endsAt,
        [receiverData],
      );
    });
  });
});
