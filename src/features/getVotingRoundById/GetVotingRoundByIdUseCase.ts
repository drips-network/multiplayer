import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundByIdResponse } from './GetVotingRoundByIdResponse';
import type IVotingRoundMapper from '../../application/interfaces/IVotingRoundMapper';

export default class GetVotingRoundByIdUseCase
  implements UseCase<GetVotingRoundByIdRequest, GetVotingRoundByIdResponse>
{
  private readonly _repository: IVotingRoundRepository;
  private readonly _votingRoundMapper: IVotingRoundMapper;

  public constructor(
    repository: IVotingRoundRepository,
    votingRoundMapper: IVotingRoundMapper,
  ) {
    this._repository = repository;
    this._votingRoundMapper = votingRoundMapper;
  }

  public async execute(
    request: GetVotingRoundByIdRequest,
  ): Promise<GetVotingRoundByIdResponse> {
    const votingRound = await this._repository.getById(request.id);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return this._votingRoundMapper.mapToDto(votingRound);
  }
}
