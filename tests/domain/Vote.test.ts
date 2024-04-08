import { TOTAL_VOTE_WEIGHT } from '../../src/domain/constants';
import type { Receiver } from '../../src/domain/votingRoundAggregate/Vote';
import Vote from '../../src/domain/votingRoundAggregate/Vote';

describe('Vote', () => {
  describe('receivers', () => {
    it('should get and set receivers', () => {
      // Arrange
      const vote = new Vote();
      const receivers = [
        {
          accountId: 'accountId',
        },
      ] as Receiver[];

      // Act
      vote.receivers = receivers;

      // Assert
      expect(vote.receivers).toEqual(receivers);
      expect(vote._receiversJson).toEqual(JSON.stringify(receivers));
    });
  });

  describe('create', () => {
    it('should throw when votingRound is missing', () => {
      // Act
      const create = () => Vote.create(null as any, null as any, null as any);

      // Assert
      expect(create).toThrow('Invalid votingRound.');
    });

    it('should throw when collaborator is missing', () => {
      // Act
      const create = () => Vote.create({} as any, null as any, null as any);

      // Assert
      expect(create).toThrow('Invalid collaborator.');
    });

    it('should throw when receivers are missing', () => {
      // Act
      const create = () => Vote.create({} as any, {} as any, null as any);

      // Assert
      expect(create).toThrow('Invalid receivers.');
    });

    it('should throw when receivers are empty', () => {
      // Act
      const create = () => Vote.create({} as any, {} as any, [] as any);

      // Assert
      expect(create).toThrow('Invalid receivers.');
    });

    it('should throw when receiver weight is not a positive integer', () => {
      // Arrange
      const receivers = [
        {
          accountId: 'accountId',
          weight: 0,
        },
      ] as Receiver[];

      // Act
      const create = () => Vote.create({} as any, {} as any, receivers);

      // Assert
      expect(create).toThrow('Invalid weight.');
    });

    it('should throw when the sum of receivers weight is not equal to 1000000', () => {
      // Arrange
      const receivers = [
        {
          accountId: 'accountId',
          weight: 10,
        },
      ] as Receiver[];

      // Act
      const create = () => Vote.create({} as any, {} as any, receivers);

      // Assert
      expect(create).toThrow(
        `The sum of the weights must be ${TOTAL_VOTE_WEIGHT}.`,
      );
    });

    it('should create a vote', () => {
      // Arrange
      const votingRound = {} as any;
      const collaborator = {} as any;
      const receivers = [
        {
          accountId: 'accountId',
          weight: 1000000,
        },
      ] as Receiver[];

      // Act
      const vote = Vote.create(votingRound, collaborator, receivers);

      // Assert
      expect(vote._votingRound).toEqual(votingRound);
      expect(vote._collaborator).toEqual(collaborator);
      expect(vote.receivers).toEqual(receivers);
    });
  });
});
