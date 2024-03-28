import type { Logger } from 'winston';
import { getAddress } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import Publisher from '../../domain/publisherAggregate/Publisher';
import type { Address } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import Collaborator from '../../domain/collaboratorAggregate/Collaborator';
import Auth from '../../application/Auth';

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
    const {
      startsAt,
      endsAt,
      dripListId,
      name,
      description,
      publisherAddress,
      collaborators,
      signature,
      date,
      privateVotes,
      nominationEndsAt,
      nominationStartsAt,
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft Drip List with ID '${dripListId}'.`,
    );

    assertIsAddress(publisherAddress);

    this._verifyMessage(
      publisherAddress,
      collaborators.map((c) => c as Address),
      new Date(date),
      signature,
      dripListId,
    );

    const newVotingRoundId = await this._votingRoundService.start(
      startsAt,
      endsAt,
      Publisher.create(publisherAddress),
      dripListId ? toDripListId(dripListId) : undefined,
      name,
      description,
      collaborators.map((c) => Collaborator.create(getAddress(c) as Address)),
      privateVotes,
      nominationStartsAt,
      nominationEndsAt,
    );

    this._logger.info(
      `Started successfully a new voting round with ID '${newVotingRoundId}'.`,
    );

    return {
      newVotingRoundId,
    };
  }

  private _verifyMessage(
    publisherAddress: Address,
    collaborators: Address[],
    currentTime: Date,
    signature: string,
    dripListId: string | undefined,
  ): void {
    let reconstructedMessage: string;

    // Existing Drip List.
    if (dripListId) {
      reconstructedMessage = Auth.START_VOTING_ROUND_MESSAGE_TEMPLATE(
        currentTime,
        publisherAddress,
        dripListId,
        collaborators,
      );
    }
    // Draft Drip List.
    else {
      reconstructedMessage = Auth.CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(
        currentTime,
        publisherAddress,
        collaborators,
      );
    }

    Auth.verifyMessage(
      reconstructedMessage,
      signature,
      publisherAddress,
      currentTime,
    );
  }
}
