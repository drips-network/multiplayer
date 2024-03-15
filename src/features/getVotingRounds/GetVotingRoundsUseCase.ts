import type UseCase from '../../application/interfaces/IUseCase';
import type { GetVotingRoundsRequest } from './GetVotingRoundsRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundsResponse } from './GetVotingRoundsResponse';
import type { Address, DripListId } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';

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
      votingRounds: votingRounds.map((votingRound) => ({
        id: votingRound._id,
        startsAt: votingRound._startsAt,
        endsAt: votingRound._endsAt,
        status: votingRound.status,
        dripListId: votingRound._dripListId,
        name: votingRound._name,
        description: votingRound._description,
        publisherAddress: votingRound._publisher._address,
        votes: votingRound.getLatestVotes().map((collaboratorsWithVotes) => ({
          collaboratorAddress: collaboratorsWithVotes.collaborator._address,
          latestVote:
            collaboratorsWithVotes.latestVote?.receivers?.map((receiver) =>
              this._toDto(receiver),
            ) || undefined,
        })),
        result: votingRound
          .getResult()
          .map((receiver) => this._toDto(receiver)),
      })),
    };
  }

  private _toDto(receiver: Receiver) {
    if ('address' in receiver) {
      return {
        accountId: receiver.accountId,
        address: receiver.address,
        weight: receiver.weight,
        type: receiver.type,
      };
    }
    if ('url' in receiver) {
      return {
        accountId: receiver.accountId,
        url: receiver.url,
        weight: receiver.weight,
        type: receiver.type,
      };
    }

    return {
      accountId: receiver.accountId as string,
      weight: receiver.weight,
      type: receiver.type,
    };
  }
}
