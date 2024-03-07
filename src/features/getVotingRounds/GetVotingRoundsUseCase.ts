import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { Address, VotingRoundDripListId } from '../../domain/typeUtils';
import {
  assertIsEthAddress,
  assertIsVotingRoundDripListId,
} from '../../domain/typeUtils';

export default class GetVotingRoundsUseCase
  implements UseCase<GetVotingRoundsRequest, GetVotingRoundsResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundsRequest,
  ): Promise<GetVotingRoundsResponse> {
    let publisherAddress: Address | undefined;

    if (request.publisherAddress) {
      assertIsEthAddress(request.publisherAddress);

      publisherAddress = request.publisherAddress;
    }

    let dripListId: VotingRoundDripListId | undefined;

    if (request.dripListId) {
      assertIsVotingRoundDripListId(request.dripListId);
      dripListId = request.dripListId;
    }

    const votingRounds = await this._repository.getByFilter({
      publisherAddress,
      dripListId,
    });

    return {
      votingRounds: votingRounds.map((votingRound) => ({
        id: votingRound._id,
        status: votingRound.status,
      })),
    };
  }
}
