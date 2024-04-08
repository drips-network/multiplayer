import { Wallet } from 'ethers';
import Collaborator from '../../src/domain/collaboratorAggregate/Collaborator';
import type { Address } from '../../src/domain/typeUtils';

describe('Collaborator', () => {
  describe('create', () => {
    it('should throw when address is invalid', () => {
      // Act
      const create = () => Collaborator.create('invalid address' as Address);

      // Assert
      expect(create).toThrow('Invalid address.');
    });

    it('should create a Collaborator', () => {
      // Arrange
      const { address } = Wallet.createRandom();

      // Act
      const collaborator = Collaborator.create(address as Address);

      // Assert
      expect(collaborator._address).toBe(address);
    });
  });
});
