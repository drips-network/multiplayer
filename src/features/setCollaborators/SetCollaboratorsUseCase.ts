import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { SetCollaboratorsRequest } from './SetCollaboratorsRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import { toAddress, toAddressDriverId } from '../../domain/typeUtils';

export default class SetCollaboratorsUseCase
  implements UseCase<SetCollaboratorsRequest>
{
  private readonly _logger: Logger;
  private readonly _votingRoundService: VotingRoundService;

  public constructor(logger: Logger, votingRoundService: VotingRoundService) {
    this._logger = logger;
    this._votingRoundService = votingRoundService;
  }

  public async execute(request: SetCollaboratorsRequest): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { votingRoundId, collaborators } = request;

    this._logger.info(
      `Setting collaborators for voting round with ID '${votingRoundId}'...`,
    );

    await this._votingRoundService.setCollaborators(
      votingRoundId,
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
