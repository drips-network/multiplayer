import type { Logger } from 'winston';
import { getAddress, verifyMessage } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import type VotingRoundService from '../../domain/services/VotingRoundService';
import Publisher from '../../domain/publisherAggregate/Publisher';
import type { Address } from '../../domain/typeUtils';
import { assertIsAddress, toDripListId } from '../../domain/typeUtils';
import Collaborator from '../../domain/collaboratorAggregate/Collaborator';
import { UnauthorizedError } from '../../application/errors';

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
      dripListId,
      endsAt,
      name,
      description,
      publisherAddress,
      collaborators,
      signature,
      date,
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${dripListId}'.`,
    );

    assertIsAddress(publisherAddress);

    this._verifyPublisher(
      publisherAddress,
      collaborators.map((c) => c as Address),
      new Date(date),
      signature,
      dripListId,
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

  private _verifyPublisher(
    publisherAddress: Address,
    collaborators: Address[],
    currentTime: Date,
    signature: string,
    dripListId: string | undefined,
  ): void {
    const sortedCollaborators = collaborators.sort(
      (a, b) => Number(a) - Number(b),
    );

    let reconstructedMessage: string;

    // Existing Drip List.
    if (dripListId) {
      reconstructedMessage = `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(sortedCollaborators)}`;
    }
    // Draft Drip List.
    else {
      reconstructedMessage = `Create a new collaborative Drip List owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(sortedCollaborators)}`;
    }

    const originalSigner = verifyMessage(reconstructedMessage, signature);

    if (originalSigner.toLowerCase() !== publisherAddress.toLowerCase()) {
      throw new UnauthorizedError('Signature is not valid.');
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (currentTime < oneDayAgo || currentTime > now) {
      throw new UnauthorizedError('Vote is outdated.');
    }
  }
}
