import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { Address, DripListId } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import type IVotingRoundMapper from '../../application/interfaces/IVotingRoundMapper';

export default class GetVotingRoundsUseCase
  implements UseCase<GetVotingRoundsRequest, GetVotingRoundsResponse>
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
    request: GetVotingRoundsRequest,
  ): Promise<GetVotingRoundsResponse> {
    let publisherAddress: Address | undefined;

    if (request.publisherAddress) {
      assertIsAddress(request.publisherAddress);

      publisherAddress = request.publisherAddress;
    }

    let dripListId: DripListId | undefined;

    if (request.dripListId) {
      dripListId = toDripListId(request.dripListId);
    }

    const votingRounds = await this._repository.getByFilter({
      publisherAddress,
      dripListId,
    });

    return {
      votingRounds: votingRounds.map((votingRound) =>
        this._votingRoundMapper.mapToDto(votingRound),
      ),
    };
  }
}
