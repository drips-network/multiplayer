import type { SafeTx } from '../../domain/linkedDripList/Link';
import type VotingRound from '../../domain/votingRoundAggregate/VotingRound';

export default interface ISafeService {
  checkSafeTxAndLinkPending(votingRound: VotingRound): Promise<void>;
  getSafeTransaction(safeTransactionHash: string): Promise<SafeTx>;
}
