import type { SafeTx } from '../../domain/linkedDripList/Link';
import type VotingRound from '../../domain/votingRoundAggregate/VotingRound';
import type { ChainId } from '../network';

export default interface ISafeService {
  checkSafeTxAndLinkPending(votingRound: VotingRound): Promise<void>;
  getSafeTransaction(
    safeTransactionHash: string,
    chainId: ChainId,
  ): Promise<SafeTx>;
}
