import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import Publisher from '../../domain/publisherAggregate/Publisher';
import {
  toAddress,
  toAddressDriverId,
  toDripListId,
} from '../../domain/typeUtils';
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
      startsAt,
      endsAt,
      name,
      description,
      publisherAddress,
      publisherAddressDriverId,
      collaborators,
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${dripListId}'.`,
    );

    const newVotingRoundId = await this._votingRoundService.start(
      startsAt,
      endsAt,
      Publisher.create(publisherAddress, publisherAddressDriverId),
      dripListId ? toDripListId(dripListId) : undefined,
      name,
      description,
      collaborators.map((c) =>
        Collaborator.create(
          toAddressDriverId(c.addressDriverId),
          toAddress(c.address),
        ),
      ),
    );

    this._logger.info(
      `Started successfully a new voting round with ID '${newVotingRoundId}'.`,
    );

    return {
      newVotingRoundId,
    };
  }
}
