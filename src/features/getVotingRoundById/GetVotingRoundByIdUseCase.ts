import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundByIdResponse } from './GetVotingRoundByIdResponse';
import type IVotingRoundMapper from '../../application/interfaces/IVotingRoundMapper';
import { NotFoundError } from '../../application/errors';
import { VotingRoundStatus } from '../../domain/votingRoundAggregate/VotingRound';
import type SafeService from '../../application/SafeService';

export default class GetVotingRoundByIdUseCase
  implements UseCase<GetVotingRoundByIdRequest, GetVotingRoundByIdResponse>
{
  private readonly _safeService: SafeService;
  private readonly _repository: IVotingRoundRepository;
  private readonly _votingRoundMapper: IVotingRoundMapper;

  public constructor(
    repository: IVotingRoundRepository,
    votingRoundMapper: IVotingRoundMapper,
    safeService: SafeService,
  ) {
    this._repository = repository;
    this._safeService = safeService;
    this._votingRoundMapper = votingRoundMapper;
  }

  public async execute(
    request: GetVotingRoundByIdRequest,
  ): Promise<GetVotingRoundByIdResponse> {
    const { id } = request;

    const votingRound = await this._repository.getById(id);

    if (!votingRound) {
      throw new NotFoundError(`Voting round not found.`);
    }

    if (votingRound.status === VotingRoundStatus.PendingLinkCompletion) {
      await this._safeService.checkSafeTxAndLinkPending(votingRound);
    }

    return this._votingRoundMapper.mapToDto(votingRound);
  }
}
