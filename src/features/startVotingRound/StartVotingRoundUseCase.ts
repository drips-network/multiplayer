import type { Logger } from 'winston';
import { getAddress } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import Publisher from '../../domain/publisherAggregate/Publisher';
import type { Address } from '../../domain/typeUtils';
import { toDripListId } from '../../domain/typeUtils';
import Collaborator from '../../domain/collaboratorAggregate/Collaborator';

export default class StartVotingRoundUseCase
  implements UseCase<StartVotingRoundRequest, StartVotingRoundResponse>
{
  private readonly _logger: Logger;
  private readonly _votingRoundService: VotingRoundService;

  public constructor(logger: Logger, votingRoundService: VotingRoundService) {
    this._logger = logger;
    this._votingRoundService = votingRoundService;
  }

  public async execute(
    request: StartVotingRoundRequest,
  ): Promise<StartVotingRoundResponse> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const {
      dripListId,
      endsAt,
      name,
      description,
      publisherAddress,
      collaborators,
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${dripListId}'.`,
    );

    const newVotingRoundId = await this._votingRoundService.start(
      endsAt,
      Publisher.create(publisherAddress),
      dripListId ? toDripListId(dripListId) : undefined,
      name,
      description,
      collaborators.map((c) => Collaborator.create(getAddress(c) as Address)),
    );

    this._logger.info(
      `Started successfully a new voting round with ID '${newVotingRoundId}'.`,
    );

    return {
      newVotingRoundId,
    };
  }
}
