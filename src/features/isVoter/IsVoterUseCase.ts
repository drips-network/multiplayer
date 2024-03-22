import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Address } from '../../domain/typeUtils';

type IsVoterCommand = {
  votingRoundId: UUID;
  collaboratorAddress: Address;
};

export default class IsVoterUseCase
  implements UseCase<IsVoterCommand, boolean>
{
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository) {
    this._repository = repository;
  }

  public async execute(request: IsVoterCommand): Promise<boolean> {
    const votingRound = await this._repository.getById(request.votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    return (
      votingRound._collaborators?.filter(
        (c) => c._address === request.collaboratorAddress,
      ).length === 1
    );
  }
}
