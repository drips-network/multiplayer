import type { ScheduleDto, VotingRoundDto } from './dtos';
import type IReceiverMapper from './interfaces/IReceiverMapper';
import type IVotingRoundMapper from './interfaces/IVotingRoundMapper';
import shouldNeverHappen from './shouldNeverHappen';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';
import { VotingRoundStatus } from '../domain/votingRoundAggregate/VotingRound';

export default class VotingRoundMapper implements IVotingRoundMapper {
  private readonly _receiverMapper: IReceiverMapper;

  public constructor(receiverMapper: IReceiverMapper) {
    this._receiverMapper = receiverMapper;
  }

  mapToDto(votingRound: VotingRound): VotingRoundDto {
    const schedule: ScheduleDto = votingRound.nominationPeriod.isSet
      ? {
          voting: {
            startsAt: votingRound._votingStartsAt,
            endsAt: votingRound._votingEndsAt,
          },
          nomination: {
            endsAt: votingRound._nominationEndsAt || shouldNeverHappen(),
            startsAt: votingRound._nominationStartsAt || shouldNeverHappen(),
          },
        }
      : {
          voting: {
            startsAt: votingRound._votingStartsAt,
            endsAt: votingRound._votingEndsAt,
          },
          nomination: undefined,
        };

    const nominationPeriod = votingRound.nominationPeriod.isSet
      ? {
          isOpen: votingRound.nominationPeriod.isOpen,
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
      dripListId: votingRound._dripListId || null,
      name: votingRound._name || null,
      description: votingRound._description || null,
      publisherAddress: votingRound._publisher._address,
      areVotesPrivate: votingRound._areVotesPrivate,
      linkedAt: votingRound._link?.linkedAt || null,
      result:
        (votingRound._areVotesPrivate &&
          votingRound.status !== VotingRoundStatus.Completed &&
          votingRound.status !== VotingRoundStatus.Linked) ||
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
            collaboratorAddress: collaboratorsWithVotes.collaborator,
            votedAt: collaboratorsWithVotes.latestVote?._updatedAt || null,
            latestVote:
              collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
                this._receiverMapper.mapToReceiverDto(receiver),
              ) || null,
          })),
      hasVotingPeriodStarted: votingRound.votingPeriod.hasStarted,
      nominationPeriod,
      allowedReceivers:
        votingRound._allowedReceivers?.map((r) => r.receiverData) || null,
    };
  }
}
