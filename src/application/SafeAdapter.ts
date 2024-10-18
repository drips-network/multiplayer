import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { ethers, hashMessage } from 'ethers';
import type ISafeAdapter from './interfaces/ISafeAdapter';
import getProvider from './getProvider';
import { getNetwork, SAFE_UNSUPPORTED_NETWORKS, type ChainId } from './network';

export class SafeAdapter implements ISafeAdapter {
  async isValidSignature(
    message: string,
    signature: string,
    signerAddress: string,
    chainId: ChainId,
  ): Promise<boolean> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: getProvider(chainId),
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
    chainId: ChainId,
  ): Promise<SafeMultisigTransactionResponse> {
    if (SAFE_UNSUPPORTED_NETWORKS.includes(getNetwork(chainId).name)) {
      throw new Error(`Unsupported Safe chain '${chainId}'.`);
    }

    const safeApiKit = new SafeApiKit({
      chainId: BigInt(chainId),
    });

    return safeApiKit.getTransaction(safeTransactionHash);
  }
}
