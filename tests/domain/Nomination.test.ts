import type { Address } from '../../src/domain/typeUtils';
import Nomination from '../../src/domain/votingRoundAggregate/Nomination';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';

describe('Nomination', () => {
  describe('receiver', () => {
    it('should get and set receiver', () => {
      // Arrange
      const vote = new Nomination();
      const receiver = {
        accountId: 'accountId',
      } as Receiver;

      // Act
      vote.receiver = receiver;

      // Assert
      expect(vote.receiver).toEqual(receiver);
      expect(vote._receiverJson).toEqual(JSON.stringify(receiver));
    });
  });

  describe('impactMetrics', () => {
    it('should get and set impactMetrics', () => {
      // Arrange
      const vote = new Nomination();
      const impactMetrics = [
        {
          accountId: 'accountId',
        },
      ];

      // Act
      vote.impactMetrics = impactMetrics;

      // Assert
      expect(vote.impactMetrics).toEqual(impactMetrics);
      expect(vote._impactMetricsJson).toEqual(JSON.stringify(impactMetrics));
    });
  });

  describe('create', () => {
    it('should throw when votingRound is missing', () => {
      // Act
      const create = () =>
        Nomination.create(
          null as any,
          {} as any,
          'address' as Address,
          'description',
          [],
        );

      // Assert
      expect(create).toThrow('Invalid votingRound.');
    });

    it('should throw when receiver is missing', () => {
      // Act
      const create = () =>
        Nomination.create(
          {} as any,
          null as any,
          'address' as Address,
          'description',
          [],
        );

      // Assert
      expect(create).toThrow('Invalid receiver.');
    });

    it('should throw when nominatedBy is missing', () => {
      // Act
      const create = () =>
        Nomination.create({} as any, {} as any, null as any, 'description', []);

      // Assert
      expect(create).toThrow('Invalid nominatedBy.');
    });

    it('should throw when description is missing', () => {
      // Act
      const create = () =>
        Nomination.create(
          {} as any,
          {} as any,
          'address' as any,
          null as any,
          [],
        );

      // Assert
      expect(create).toThrow('Invalid description.');
    });

    it('should throw when impactMetrics are missing', () => {
      // Act
      const create = () =>
        Nomination.create(
          {} as any,
          {} as any,
          'address' as any,
          'description',
          null as any,
        );

      // Assert
      expect(create).toThrow('Invalid impactMetrics.');
    });

    it('should create nomination', () => {
      // Arrange
      const votingRound = {} as any;
      const receiver = {} as any;
      const nominatedBy = 'address' as Address;
      const description = 'description';
      const impactMetrics = [
        {
          accountId: 'accountId',
        },
      ];

      // Act
      const nomination = Nomination.create(
        votingRound,
        receiver,
        nominatedBy,
        description,
        impactMetrics,
      );

      // Assert
      expect(nomination).toBeInstanceOf(Nomination);
      expect(nomination._votingRound).toEqual(votingRound);
      expect(nomination.receiver).toEqual(receiver);
      expect(nomination._nominatedBy).toEqual(nominatedBy);
      expect(nomination._description).toEqual(description);
      expect(nomination.impactMetrics).toEqual(impactMetrics);
    });
  });
});
