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
    } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${dripListId}'.`,
    );

    assertIsAddress(publisherAddress);

    await this._verifyPublisher(
      publisherAddress,
      collaborators.map((c) => c as Address),
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
    signature: string,
    dripListId: string | undefined,
  ): void {
    let reconstructedMessage = `I '${publisherAddress}', create a new voting round with the following collaborators: ${JSON.stringify(collaborators)}`;

    if (dripListId) {
      reconstructedMessage += ` for the draft drip list with ID '${toDripListId(dripListId)}.'`;
    }

    const originalSigner = verifyMessage(reconstructedMessage, signature);

    if (originalSigner.toLowerCase() !== publisherAddress.toLowerCase()) {
      throw new UnauthorizedError('Signature is not valid.');
    }
  }
}
