import type { SafeTx } from '../../src/domain/linkedDripList/Link';
import Link, { LinkStatus } from '../../src/domain/linkedDripList/Link';
import type { DripListId } from '../../src/domain/typeUtils';
import type VotingRound from '../../src/domain/votingRoundAggregate/VotingRound';

describe('Link', () => {
  describe('status', () => {
    it('should return Completed when link is not Safe', () => {
      // Arrange
      const link = new Link();
      link._safeTransactionHash = undefined;

      // Act
      const result = link.status;

      // Assert
      expect(result).toBe(LinkStatus.Completed);
    });

    it('should return Completed when link is Safe and tx is successfully completed', () => {
      // Arrange
      const link = new Link();
      link._safeTransactionHash = 'safeTransactionHash';
      link._isSafeTransactionExecuted = true;

      // Act
      const result = link.status;

      // Assert
      expect(result).toBe(LinkStatus.Completed);
    });

    it('should return AwaitingSafeTxExecution when link is Safe and tx is pending', () => {
      // Arrange
      const link = new Link();
      link._safeTransactionHash = 'safeTransactionHash';
      link._isSafeTransactionExecuted = false;

      // Act
      const result = link.status;

      // Assert
      expect(result).toBe(LinkStatus.AwaitingSafeTxExecution);
    });
  });

  describe('linkedAt', () => {
    it('should return the updated date when status is Completed', () => {
      // Arrange
      const link = new Link();
      link._updatedAt = new Date();
      link._safeTransactionHash = 'safeTransactionHash';
      link._isSafeTransactionExecuted = true;

      // Act
      const result = link.linkedAt;

      // Assert
      expect(result).toEqual(link._updatedAt);
    });

    it('should return undefined when status is not Completed', () => {
      // Arrange
      const link = new Link();
      link._safeTransactionHash = 'safeTransactionHash';
      link._isSafeTransactionExecuted = false;

      // Act
      const result = link.linkedAt;

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should throw when publisherAddress does not match the safe address', () => {
      // Arrange
      const dripListId = 'dripListId' as DripListId;
      const votingRound = {
        publisherAddress: 'publisherAddress',
      } as unknown as VotingRound;
      const safeTx = {
        safeAddress: 'safeAddress',
        transactionHash: 'transactionHash',
        isExecuted: false,
        isSuccessful: undefined,
      } as unknown as SafeTx;

      // Act
      const act = () => Link.create(dripListId, votingRound, safeTx);

      // Assert
      expect(act).toThrow(
        'Cannot create a link with a safe transaction that does not belong to the voting round publisher.',
      );
    });

    it('should throw when safeTx does not have a transaction hash', () => {
      // Arrange
      const dripListId = 'dripListId' as DripListId;
      const votingRound = {
        publisherAddress: 'publisherAddress',
      } as unknown as VotingRound;
      const safeTx = {
        safeAddress: votingRound.publisherAddress,
        transactionHash: '',
      } as unknown as SafeTx;

      // Act
      const act = () => Link.create(dripListId, votingRound, safeTx);

      // Assert
      expect(act).toThrow(
        'Cannot create a link with a safe transaction that does not have a transaction hash.',
      );
    });

    it('should throw when safeTx is not executed successfully', () => {
      // Arrange
      const dripListId = 'dripListId' as DripListId;
      const votingRound = {
        publisherAddress: 'publisherAddress',
      } as unknown as VotingRound;
      const safeTx = {
        safeAddress: votingRound.publisherAddress,
        transactionHash: 'transactionHash',
        isExecuted: true,
        isSuccessful: false,
      } as unknown as SafeTx;

      // Act
      const act = () => Link.create(dripListId, votingRound, safeTx);

      // Assert
      expect(act).toThrow(
        'Cannot create a link with a safe transaction that was not executed successfully.',
      );
    });

    it('should create a link', () => {
      // Arrange
      const dripListId = 'dripListId' as DripListId;
      const votingRound = {} as unknown as VotingRound;
      const safeTx = {
        safeAddress: votingRound.publisherAddress,
        transactionHash: 'transactionHash',
        isExecuted: false,
        isSuccessful: undefined,
      };

      // Act
      const result = Link.create(dripListId, votingRound, safeTx);

      // Assert
      expect(result._dripListId).toBe(dripListId);
      expect(result._votingRound).toBe(votingRound);
      expect(result._safeTransactionHash).toBe(safeTx.transactionHash);
      expect(result._isSafeTransactionExecuted).toBe(
        safeTx.isExecuted && safeTx.isSuccessful,
      );
    });
  });

  describe('markSafeTransactionAsExecuted', () => {
    it('should mark safe transaction as executed when status is AwaitingSafeTxExecution', () => {
      // Arrange
      const link = new Link();
      link._safeTransactionHash = 'safeTransactionHash';
      link._isSafeTransactionExecuted = false;

      // Act
      link.markSafeTransactionAsExecuted();

      // Assert
      expect(link._isSafeTransactionExecuted).toBe(true);
    });
  });
});
