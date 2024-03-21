import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundByIdRequest } from './GetVotingRoundByIdRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundByIdResponse } from './GetVotingRoundByIdResponse';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';

export default class GetVotingRoundByIdUseCase
  implements UseCase<GetVotingRoundByIdRequest, GetVotingRoundByIdResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
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
      privateVotes: votingRound._isPrivate,
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
