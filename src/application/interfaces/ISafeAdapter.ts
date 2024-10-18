import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import type { ChainId } from '../network';

export default interface ISafeAdapter {
  getTransaction(
    safeTransactionHash: string,
    chainId: ChainId,
  ): Promise<SafeMultisigTransactionResponse>;

  isValidSignature(
    message: string,
    signature: string,
    signerAddress: string,
    chainId: ChainId,
  ): Promise<boolean>;
}
