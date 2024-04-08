import { Wallet } from 'ethers';
import Publisher from '../../src/domain/publisherAggregate/Publisher';

describe('Publisher', () => {
  describe('create', () => {
    it('should throw when address is invalid', () => {
      // Act
      const create = () => Publisher.create('invalid address');

      // Assert
      expect(create).toThrow('Invalid address.');
    });

    it('should create a Publisher', () => {
      // Arrange
      const { address } = Wallet.createRandom();

      // Act
      const publisher = Publisher.create(address);

      // Assert
      expect(publisher._address).toBe(address);
    });
  });
});
