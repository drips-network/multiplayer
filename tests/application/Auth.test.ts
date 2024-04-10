import { Wallet, verifyMessage } from 'ethers';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { Auth } from '../../src/application/Auth';
import type { Address } from '../../src/domain/typeUtils';
import { yesterday } from '../testUtils';

jest.mock('@safe-global/protocol-kit');

jest.mock('../../src/application/provider');

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');

  return {
    __esModule: true,
    ...originalModule,
    verifyMessage: jest.fn(),
  };
});
jest.mock('../../src/application/Auth', () => {
  const originalModule = jest.requireActual('../../src/application/Auth');

  return {
    __esModule: true,
    ...originalModule,
    isSafe: jest.fn(),
    fetch: jest.fn(),
  };
});

describe('Auth', () => {
  const loggerMock = { info: jest.fn(), error: jest.fn() } as any;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should throw when EOA singer is not the expected', async () => {
    // Arrange
    const originalSigner = Wallet.createRandom().address as Address;
    const otherSigner = Wallet.createRandom().address as Address;
    (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        status: 404,
      }),
    );

    const auth = new Auth(loggerMock, null as any);

    // Act
    const verify = () =>
      auth.verifyMessage('message', 'signature', otherSigner, new Date());

    // Assert
    expect(verify).rejects.toThrow('Invalid signature');
  });

  it('should not throw when EOA singer is the expected', async () => {
    // Arrange
    const originalSigner = Wallet.createRandom().address as Address;
    (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        status: 404,
      }),
    );

    const auth = new Auth(loggerMock, null as any);

    // Act
    const verify = () =>
      auth.verifyMessage('message', 'signature', originalSigner, new Date());

    // Assert
    expect(verify).not.toThrow();
  });

  it('should throw when multisig singer is not the expected', async () => {
    // Arrange
    const originalSigner = Wallet.createRandom().address as Address;
    const otherSigner = Wallet.createRandom().address as Address;
    (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
      }),
    );

    (EthersAdapter as any as jest.Mock) = jest.fn();

    (Safe.create as jest.Mock).mockResolvedValueOnce({
      isValidSignature: jest.fn().mockReturnValueOnce(false),
    });

    const auth = new Auth(loggerMock, null as any);

    // Act
    const verify = () =>
      auth.verifyMessage('message', 'signature', otherSigner, new Date());

    // Assert
    expect(verify).rejects.toThrow('Invalid signature');
  });

  it('should not throw when multisig singer is the expected', async () => {
    // Arrange
    const originalSigner = Wallet.createRandom().address as Address;
    (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
      }),
    );

    (EthersAdapter as any as jest.Mock) = jest.fn();

    (Safe.create as jest.Mock).mockResolvedValueOnce({
      isValidSignature: jest.fn().mockReturnValueOnce(true),
    });

    const auth = new Auth(loggerMock, null as any);

    // Act
    const verify = () =>
      auth.verifyMessage('message', 'signature', originalSigner, new Date());

    // Assert
    expect(verify).not.toThrow();
  });

  it('should throw when signature is outdated', async () => {
    // Arrange
    const originalSigner = Wallet.createRandom().address as Address;
    (verifyMessage as jest.Mock).mockReturnValueOnce(originalSigner);

    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        status: 404,
      }),
    );

    const auth = new Auth(loggerMock, null as any);

    // Act
    const verify = () =>
      auth.verifyMessage('message', 'signature', originalSigner, yesterday);

    // Assert
    expect(verify).rejects.toThrow('Vote is outdated.');
  });
});
