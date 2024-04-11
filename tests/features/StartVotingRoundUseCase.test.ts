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
import type { Address } from '../../src/domain/typeUtils';
import Publisher from '../../src/domain/publisherAggregate/Publisher';
import Collaborator from '../../src/domain/collaboratorAggregate/Collaborator';

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
      );

      const request: StartVotingRoundRequest = {
        schedule: {
          startsAt: new Date(),
          endsAt: new Date(),
          nominationEndsAt: new Date(),
          nominationStartsAt: new Date(),
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
        request.collaborators,
      );
    });

    it('should verify signature for a new Drip List', async () => {
      // Arrange
      const useCase = new StartVotingRoundUseCase(
        loggerMock,
        votingRoundServiceMock,
        authMock,
      );

      const request: StartVotingRoundRequest = {
        schedule: {
          startsAt: new Date(),
          endsAt: new Date(),
          nominationEndsAt: new Date(),
          nominationStartsAt: new Date(),
        },
        publisherAddress: Wallet.createRandom().address,
        collaborators: [Wallet.createRandom().address],
        signature: 'signature',
        date: new Date(),
        areVotesPrivate: false,
        name: 'name',
        description: 'description',
      };

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
        request.collaborators,
      );
    });

    it('should start a new Voting Round', async () => {
      // Arrange
      const useCase = new StartVotingRoundUseCase(
        loggerMock,
        votingRoundServiceMock,
        authMock,
      );

      const request: StartVotingRoundRequest = {
        schedule: {
          startsAt: new Date(),
          endsAt: new Date(),
          nominationEndsAt: new Date(),
          nominationStartsAt: new Date(),
        },
        publisherAddress: Wallet.createRandom().address,
        collaborators: [Wallet.createRandom().address],
        signature: 'signature',
        date: new Date(),
        areVotesPrivate: false,
        name: 'name',
        description: 'description',
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(votingRoundServiceMock.start).toHaveBeenCalledWith(
        request.schedule.startsAt,
        request.schedule.endsAt,
        Publisher.create(request.publisherAddress),
        undefined,
        request.name,
        request.description,
        request.collaborators.map((c) =>
          Collaborator.create(getAddress(c) as Address),
        ),
        request.areVotesPrivate,
        request.schedule.nominationStartsAt,
        request.schedule.nominationEndsAt,
      );
    });
  });
});
