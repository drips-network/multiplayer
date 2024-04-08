import Link from '../../src/domain/linkedDripList/Link';
import type { DripListId } from '../../src/domain/typeUtils';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';

describe('link', () => {
  describe('create', () => {
    it('should create a link', () => {
      // Arrange
      const dripListId = 'dripListId' as DripListId;
      const votingRound = {} as unknown as VotingRound;

      // Act
      const result = Link.create(dripListId, votingRound);

      // Assert
      expect(result._dripListId).toBe(dripListId);
      expect(result._votingRound).toBe(votingRound);
    });
  });
});
