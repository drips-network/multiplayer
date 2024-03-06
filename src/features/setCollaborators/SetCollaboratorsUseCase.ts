import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { SetCollaboratorsRequest } from './SetCollaboratorsRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import { toAddress, toAddressDriverId } from '../../domain/typeUtils';
import { NotFoundError } from '../../application/errors';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';

export default class SetCollaboratorsUseCase
  implements UseCase<SetCollaboratorsRequest>
{
  private readonly _logger: Logger;
  private readonly _votingRoundService: VotingRoundService;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundService: VotingRoundService,
    votingRoundRepository: IVotingRoundRepository,
  ) {
    this._logger = logger;
    this._votingRoundService = votingRoundService;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(request: SetCollaboratorsRequest): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { votingRoundId, collaborators } = request;

    this._logger.info(
      `Setting collaborators for voting round with ID '${votingRoundId}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`Voting round not found.`);
    }

    await this._votingRoundService.setCollaborators(
      votingRound,
      collaborators.map((collaborator) => ({
        address: toAddress(collaborator.address),
        addressDriverId: toAddressDriverId(collaborator.addressDriverId),
      })),
    );

    this._logger.info(
      `Set collaborators successfully for voting round with ID '${votingRoundId}'.`,
    );
  }
}
