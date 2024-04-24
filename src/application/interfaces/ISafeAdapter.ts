import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

export default interface ISafeAdapter {
  getTransaction(
    safeTransactionHash: string,
  ): Promise<SafeMultisigTransactionResponse>;

  isValidSignature(
    message: string,
    signature: string,
    signerAddress: string,
  ): Promise<boolean>;
}
