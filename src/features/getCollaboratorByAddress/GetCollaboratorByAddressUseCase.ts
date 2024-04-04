import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Address } from '../../domain/typeUtils';
import type { GetCollaboratorByAddressResponse } from './GetCollaboratorByAddressResponse';

type GetCollaboratorByAddressCommand = {
  votingRoundId: UUID;
  collaboratorAddress: Address;
};

export default class GetCollaboratorByAddressUseCase
  implements
    UseCase<GetCollaboratorByAddressCommand, GetCollaboratorByAddressResponse>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(
    request: GetCollaboratorByAddressCommand,
  ): Promise<GetCollaboratorByAddressResponse> {
    const votingRound = await this._repository.getById(request.votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    const isCollaborator =
      votingRound._collaborators?.filter(
        (c) => c._address === request.collaboratorAddress,
      ).length === 1;

    const hasVoted =
      votingRound._votes?.filter(
        (v) => v._collaborator._address === request.collaboratorAddress,
      ).length === 1;

    return {
      isCollaborator,
      hasVoted,
    };
  }
}
