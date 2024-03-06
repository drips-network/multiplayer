import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { CastVoteRequest } from './CastVoteRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError } from '../../application/errors';
import type ICollaboratorRepository from '../../domain/collaboratorAggregate/ICollaboratorRepository';
import { assertIsEthAddress } from '../../domain/typeUtils';

export default class CastVoteUseCase implements UseCase<CastVoteRequest> {
  private readonly _logger: Logger;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _collaboratorRepository: ICollaboratorRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: ICollaboratorRepository,
  ) {
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
    this._collaboratorRepository = collaboratorRepository;
  }

  public async execute(request: CastVoteRequest): Promise<void> {
    // TODO: Verify the request is coming from the collaborator by checking the signature token.

    const { votingRoundId, collaboratorAddress, voteAllocations } = request;

    this._logger.info(
      `Casting a vote for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`Voting round not found.`);
    }

    assertIsEthAddress(collaboratorAddress);
    const collaborator =
      await this._collaboratorRepository.getByAddress(collaboratorAddress);

    if (!collaborator) {
      throw new NotFoundError(`Collaborator not found.`);
    }

    votingRound.castVote(collaborator, voteAllocations);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Casted successfully a vote for voting round '${votingRoundId}' and collaborator '${collaboratorAddress}'.`,
    );
  }
}
