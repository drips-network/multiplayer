import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import Publisher from '../../domain/publisherAggregate/Publisher';
import { toVotingRoundDripListId } from '../../domain/typeUtils';

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
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${dripListId}'.`,
    );

    const newVotingRoundId = await this._votingRoundService.start(
      toVotingRoundDripListId(dripListId),
      startsAt,
      endsAt,
      name,
      description,
      Publisher.create(publisherAddress, publisherAddressDriverId),
    );

    this._logger.info(
      `Started successfully a new voting round with ID '${newVotingRoundId}'.`,
    );

    return {
      newVotingRoundId,
    };
  }
}
