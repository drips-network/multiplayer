import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { GetVotingRoundResultRequest } from './GetVotingRoundResultRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { GetVotingRoundResultResponse } from './GetVotingRoundResultResponse';
import type { Receiver } from '../../domain/votingRoundAggregate/Vote';
import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export default class GetVotingRoundResultUseCase
  implements UseCase<GetVotingRoundResultRequest, GetVotingRoundResultResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetVotingRoundResultRequest,
  ): Promise<GetVotingRoundResultResponse> {
    const votingRound = await this._repository.getById(request.votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return {
      result: votingRound.getResult().map((receiver) => this._toDto(receiver)),
    };
  }

  private _toDto(receiver: Receiver): ReceiverDto {
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
      accountId: receiver.accountId,
      weight: receiver.weight,
      type: receiver.type,
    };
  }
}
