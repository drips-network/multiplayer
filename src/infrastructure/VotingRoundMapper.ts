import type { ScheduleDto, VotingRoundDto } from '../application/dtos';
import type IReceiverMapper from '../application/interfaces/IReceiverMapper';
import type IVotingRoundMapper from '../application/interfaces/IVotingRoundMapper';
import shouldNeverHappen from '../application/shouldNeverHappen';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';

export default class VotingRoundMapper implements IVotingRoundMapper {
  private readonly _receiverMapper: IReceiverMapper;

  public constructor(receiverMapper: IReceiverMapper) {
    this._receiverMapper = receiverMapper;
  }

  mapToDto(votingRound: VotingRound): VotingRoundDto {
    const schedule: ScheduleDto = votingRound.hasNominationPeriod
      ? {
          startsAt: votingRound._startsAt,
          endsAt: votingRound._endsAt,
          nominationEndsAt:
            votingRound._nominationEndsAt || shouldNeverHappen(),
          nominationStartsAt:
            votingRound._nominationStartsAt || shouldNeverHappen(),
        }
      : {
          startsAt: votingRound._startsAt,
          endsAt: votingRound._endsAt,
          nominationStartsAt: undefined,
          nominationEndsAt: undefined,
        };

    const nominationPeriod = votingRound.hasNominationPeriod
      ? {
          isOpen: votingRound.isOpenForNominations,
          nominations:
            votingRound._nominations?.map((n) =>
              this._receiverMapper.mapToNominationInfoDto(n),
            ) || [],
        }
      : undefined;

    return {
      id: votingRound._id,
      schedule,
      status: votingRound.status,
      dripListId: votingRound._dripListId,
      name: votingRound._name,
      description: votingRound._description,
      publisherAddress: votingRound._publisher._address,
      areVotesPrivate: votingRound._areVotesPrivate,
      linkedAt: votingRound.linkedAt,
      result:
        (votingRound._areVotesPrivate &&
          votingRound.status !== 'completed' &&
          votingRound.status !== 'linked') ||
        !votingRound._votes?.length
          ? null
          : votingRound
              .getResult()
              .map((receiver) =>
                this._receiverMapper.mapToReceiverDto(receiver),
              ),
      votes: votingRound._areVotesPrivate
        ? null
        : votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
            collaboratorAddress: collaboratorsWithVotes.collaborator._address,
            votedAt: collaboratorsWithVotes.latestVote?._updatedAt || null,
            latestVote:
              collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
                this._receiverMapper.mapToReceiverDto(receiver),
              ) || null,
          })),
      hasVotingPeriodStarted: votingRound.hasVotingPeriodStarted,
      nominationPeriod,
    };
  }
}
