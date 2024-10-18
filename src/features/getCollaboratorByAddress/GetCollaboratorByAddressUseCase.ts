import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import type { Address } from '../../domain/typeUtils';
import type { GetCollaboratorByAddressResponse } from './GetCollaboratorByAddressResponse';
import type { GetCollaboratorByAddressRequest } from './GetCollaboratorByAddressRequest';
import type { IAuthStrategy } from '../../application/Auth';
import { REVEAL_VOTE } from '../../application/Auth';
import { ReceiverMapperFactory } from '../../application/ReceiverMapper';

type GetCollaboratorByAddressCommand = GetCollaboratorByAddressRequest & {
  votingRoundId: UUID;
  collaboratorAddress: Address;
};

export default class GetCollaboratorByAddressUseCase
  implements
    UseCase<GetCollaboratorByAddressCommand, GetCollaboratorByAddressResponse>
{
  private readonly _auth: IAuthStrategy;
  private readonly _repository: IVotingRoundRepository;

  public constructor(repository: IVotingRoundRepository, auth: IAuthStrategy) {
    this._auth = auth;
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

    const shouldRevealVote = votingRound._areVotesPrivate && signature && date;

    if (shouldRevealVote) {
      const message = REVEAL_VOTE(
        votingRoundId,
        new Date(date),
        votingRound._chainId,
      );

      await this._auth.verifyMessage(
        message,
        signature,
        collaboratorAddress,
        new Date(date),
        votingRound._chainId,
      );
    }

    const isCollaborator =
      votingRound._collaborators?.filter((c) => c === collaboratorAddress)
        .length === 1;

    const hasVoted =
      votingRound._votes?.filter((v) => v._collaborator === collaboratorAddress)
        ?.length !== 0;

    return {
      isCollaborator,
      hasVoted,
      latestVote:
        shouldRevealVote && hasVoted
          ? votingRound
              .getLatestVotes()
              .filter(
                (collaboratorsWithVotes) =>
                  collaboratorsWithVotes.collaborator === collaboratorAddress,
              )
              .map((collaborator) =>
                collaborator.latestVote?.receivers?.map((receiver) =>
                  ReceiverMapperFactory.create(
                    votingRound._chainId,
                  ).mapToReceiverDto(receiver),
                ),
              )[0] || null
          : null,
    };
  }
}
