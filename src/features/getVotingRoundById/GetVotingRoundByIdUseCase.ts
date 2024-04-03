import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundByIdResponse } from './GetVotingRoundByIdResponse';
import type IReceiverMapper from '../../application/interfaces/IReceiverMapper';

export default class GetVotingRoundByIdUseCase
  implements UseCase<GetVotingRoundByIdRequest, GetVotingRoundByIdResponse>
{
  private readonly _repository: IVotingRoundRepository;
  private readonly _receiverMapper: IReceiverMapper;

  public constructor(
    repository: IVotingRoundRepository,
    receiverMapper: IReceiverMapper,
  ) {
    this._repository = repository;
    this._receiverMapper = receiverMapper;
  }

  public async execute(
    request: GetVotingRoundByIdRequest,
  ): Promise<GetVotingRoundByIdResponse> {
    const votingRound = await this._repository.getById(request.id);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return {
      id: votingRound._id,
      startsAt: votingRound._startsAt,
      endsAt: votingRound._endsAt,
      status: votingRound.status,
      dripListId: votingRound._dripListId,
      name: votingRound._name,
      description: votingRound._description,
      publisherAddress: votingRound._publisher._address,
      privateVotes: votingRound._privateVotes,
      linkedAt: votingRound.linkedAt,
      result:
        votingRound._privateVotes || !votingRound._votes?.length
          ? null
          : votingRound
              .getResult()
              .map((receiver) =>
                this._receiverMapper.mapToReceiverDto(receiver),
              ),
      votes: votingRound._privateVotes
        ? null
        : votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
            collaboratorAddress: collaboratorsWithVotes.collaborator._address,
            votedAt: collaboratorsWithVotes.latestVote?._updatedAt || null,
            latestVote:
              collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
                this._receiverMapper.mapToReceiverDto(receiver),
              ) || null,
          })),
      nominationEndsAt: votingRound._nominationEndsAt,
      nominationStartsAt: votingRound._nominationStartsAt,
      hasVotingPeriodStarted: votingRound.hasVotingPeriodStarted,
      acceptsNominations: votingRound.acceptsNominations,
      isOpenForNominations: votingRound.isOpenForNominations,
      nominations: votingRound._nominations?.map((n) =>
        this._receiverMapper.mapToNominationInfoDto(n),
      ),
    };
  }
}
