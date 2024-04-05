import type VotingRound from '../../domain/votingRoundAggregate/VotingRound';
import type { VotingRoundDto } from '../dtos';

export default interface IVotingRoundMapper {
  mapToDto(votingRound: VotingRound): VotingRoundDto;
}
