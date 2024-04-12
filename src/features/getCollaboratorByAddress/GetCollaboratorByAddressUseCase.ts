import type { UUID } from 'crypto';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Address } from '../../domain/typeUtils';
import type { GetCollaboratorByAddressResponse } from './GetCollaboratorByAddressResponse';
import type { GetCollaboratorByAddressRequest } from './GetCollaboratorByAddressRequest';
import Auth from '../../application/Auth';
import { toDto } from '../../application/dtos/ReceiverDto';

type GetCollaboratorByAddressCommand = GetCollaboratorByAddressRequest & {
  votingRoundId: UUID;
  collaboratorAddress: Address;
};

export default class GetCollaboratorByAddressUseCase
  implements
    UseCase<GetCollaboratorByAddressCommand, GetCollaboratorByAddressResponse>
{
  private readonly _logger: Logger;
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository, logger: Logger) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    command: GetCollaboratorByAddressCommand,
  ): Promise<GetCollaboratorByAddressResponse> {
    const { votingRoundId, collaboratorAddress, date, signature } = command;

    const votingRound = await this._repository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`VotingRound not found.`);
    }

    if ((signature && !date) || (!signature && date)) {
      throw new UnauthorizedError(
        `Both signature and date must be provided for authentication.`,
      );
    }

    const shouldRevealVote = votingRound._privateVotes && signature && date;

    if (shouldRevealVote) {
      await Auth.verifyMessage(
        Auth.REVEAL_VOTE(votingRoundId, new Date(date)),
        signature,
        collaboratorAddress,
        new Date(date),
        this._logger,
      );
    }

    const isCollaborator =
      votingRound._collaborators?.filter(
        (c) => c._address === collaboratorAddress,
      ).length === 1;

    const hasVoted =
      votingRound._votes?.filter(
        (v) => v._collaborator._address === collaboratorAddress,
      ).length === 1;

    return {
      isCollaborator,
      hasVoted,
      latestVote:
        shouldRevealVote && hasVoted
          ? votingRound
              .getLatestVotes()
              .filter(
                (collaboratorsWithVotes) =>
                  collaboratorsWithVotes.collaborator._address ===
                  collaboratorAddress,
              )
              .map((collaborator) =>
                collaborator.latestVote?.receivers?.map((receiver) =>
                  toDto(receiver),
                ),
              )[0] || null
          : null,
    };
  }
}
