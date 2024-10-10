import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers, hashMessage } from 'ethers';
import type ISafeAdapter from './interfaces/ISafeAdapter';
import appSettings from '../appSettings';
import getProvider from './getProvider';

export class SafeAdapter implements ISafeAdapter {
  async isValidSignature(
    message: string,
    signature: string,
    signerAddress: string,
  ): Promise<boolean> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: getProvider(),
    });

    const safeSdk: Safe = await Safe.create({
      ethAdapter,
      safeAddress: signerAddress,
    });

    const hash = hashMessage(message);

    return safeSdk.isValidSignature(hash, signature);
  }
  getTransaction(
    safeTransactionHash: string,
  ): Promise<SafeMultisigTransactionResponse> {
    const safeApiKit = new SafeApiKit({
      chainId: BigInt(appSettings.chainId),
    });

    return safeApiKit.getTransaction(safeTransactionHash);
  }
}

export class UnsupportedSafeOperationsAdapter implements ISafeAdapter {
  isValidSignature(): Promise<boolean> {
    throw new Error(
      `Safe operations are not supported on chain ${appSettings.chainId}`,
    );
  }

  getTransaction(): Promise<SafeMultisigTransactionResponse> {
    throw new Error(
      `Safe operations are not supported on chain ${appSettings.chainId}`,
    );
  }
}
