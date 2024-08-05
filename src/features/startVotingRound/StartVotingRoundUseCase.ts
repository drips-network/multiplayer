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
import type { IAuthStrategy } from '../../application/Auth';
import {
  CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE,
  START_VOTING_ROUND_MESSAGE_TEMPLATE,
} from '../../application/Auth';
import type { AllowedReceiverData } from '../../domain/allowedReceiver/AllowedReceiver';
import type IReceiverMapper from '../../application/interfaces/IReceiverMapper';

export default class StartVotingRoundUseCase
  implements UseCase<StartVotingRoundRequest, StartVotingRoundResponse>
{
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _receiverMapper: IReceiverMapper;
  private readonly _votingRoundService: VotingRoundService;

  public constructor(
    logger: Logger,
    votingRoundService: VotingRoundService,
    auth: IAuthStrategy,
    receiverMapper: IReceiverMapper,
  ) {
    this._auth = auth;
    this._logger = logger;
    this._receiverMapper = receiverMapper;
    this._votingRoundService = votingRoundService;
  }

  public async execute(
    request: StartVotingRoundRequest,
  ): Promise<StartVotingRoundResponse> {
    const {
      schedule: {
        voting: { startsAt: votingStartsAt, endsAt: votingEndsAt },
        nomination,
      },
      publisherAddress,
      collaborators,
      signature,
      date,
      areVotesPrivate,
    } = request;

    const dripListId = 'dripListId' in request ? request.dripListId : undefined;
    const name = 'name' in request ? request.name : undefined;
    const description =
      'description' in request ? request.description : undefined;
    const nominationStartsAt = nomination?.startsAt;
    const nominationEndsAt = nomination?.endsAt;
    const allowedReceivers =
      'allowedReceivers' in request ? request.allowedReceivers : undefined;

    this._logger.info(
      `Starting a new voting round for ${dripListId ? 'the Drip List with ID' : 'a Draft Drip List'} '${dripListId ?? ''}'.`,
    );

    assertIsAddress(publisherAddress);

    await this._verifyMessage(
      publisherAddress,
      collaborators.map((c) => c as Address),
      date,
      signature,
      dripListId,
    );

    let allowedReceiversData: AllowedReceiverData[] = [];
    if (allowedReceivers?.length) {
      allowedReceiversData = await Promise.all(
        allowedReceivers.map(async (receiverDto) =>
          this._receiverMapper.mapToAllowedReceiver(receiverDto),
        ),
      );
    }

    const newVotingRound = await this._votingRoundService.start(
      votingStartsAt || new Date(),
      votingEndsAt,
      Publisher.create(publisherAddress),
      dripListId ? toDripListId(dripListId) : undefined,
      name,
      description,
      collaborators.map((c) => Collaborator.create(getAddress(c) as Address)),
      areVotesPrivate,
      nominationStartsAt,
      nominationEndsAt,
      allowedReceiversData,
    );

    this._logger.info(
      `Started successfully a new voting round with ID '${newVotingRound._id}'.`,
    );

    return {
      newVotingRoundId: newVotingRound._id,
    };
  }

  private async _verifyMessage(
    publisherAddress: Address,
    collaborators: Address[],
    currentTime: Date,
    signature: string,
    dripListId: string | undefined,
  ): Promise<void> {
    let reconstructedMessage: string;

    // Existing Drip List.
    if (dripListId) {
      reconstructedMessage = START_VOTING_ROUND_MESSAGE_TEMPLATE(
        currentTime,
        publisherAddress,
        dripListId,
        collaborators,
      );
    }
    // Draft Drip List.
    else {
      reconstructedMessage = CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE(
        currentTime,
        publisherAddress,
        collaborators,
      );
    }

    await this._auth.verifyMessage(
      reconstructedMessage,
      signature,
      publisherAddress,
      currentTime,
    );
  }
}
