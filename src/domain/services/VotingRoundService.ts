import type IVotingRoundRepository from '../votingRoundAggregate/IVotingRoundRepository';
import { InvalidVotingRoundOperationError } from '../errors';
import type ICollaboratorRepository from '../collaboratorAggregate/ICollaboratorRepository';
import type { DripListId } from '../typeUtils';
import Collaborator from '../collaboratorAggregate/Collaborator';
import VotingRound from '../votingRoundAggregate/VotingRound';
import type Publisher from '../publisherAggregate/Publisher';
import type IPublisherRepository from '../publisherAggregate/IPublisherRepository';
import type IAllowedReceiversRepository from '../allowedReceiver/IAllowedReceiversRepository';
import type { AllowedReceiverData } from '../allowedReceiver/AllowedReceiver';
import AllowedReceiver from '../allowedReceiver/AllowedReceiver';

export default class VotingRoundService {
  private readonly _publisherRepository: IPublisherRepository;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _collaboratorRepository: ICollaboratorRepository;
  private readonly _allowedReceiversRepository: IAllowedReceiversRepository;

  public constructor(
    publisherRepository: IPublisherRepository,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: ICollaboratorRepository,
    allowedReceiversRepository: IAllowedReceiversRepository,
  ) {
    this._publisherRepository = publisherRepository;
    this._votingRoundRepository = votingRoundRepository;
    this._collaboratorRepository = collaboratorRepository;
    this._allowedReceiversRepository = allowedReceiversRepository;
  }

  public async start(
    startsAt: Date,
    endsAt: Date,
    publisher: Publisher,
    dripListId: DripListId | undefined,
    name: string | undefined,
    description: string | undefined,
    collaborators: Collaborator[],
    areVotesPrivate: boolean,
    nominationStartsAt: Date | undefined = undefined,
    nominationEndsAt: Date | undefined = undefined,
    allowedReceiversData: AllowedReceiverData[] | undefined = undefined,
  ): Promise<VotingRound> {
    if (!collaborators?.length) {
      throw new InvalidVotingRoundOperationError('Collaborators are missing.');
    }

    const activeVotingRounds =
      await this._votingRoundRepository.getActiveVotingRoundsByPublisher(
        publisher,
      );

    if (
      activeVotingRounds.filter((r) => r._dripListId === dripListId).length > 0
    ) {
      throw new InvalidVotingRoundOperationError(
        'Publisher already has an active voting round for this existing Drip List.',
      );
    }

    const existingCollaborators =
      await this._collaboratorRepository.getManyByAddresses(
        collaborators.map((c) => c._address),
      );

    const newCollaborators = collaborators
      .filter(
        (c) => !existingCollaborators.some((e) => e._address === c._address),
      )
      .map((c) => Collaborator.create(c._address));

    await this._collaboratorRepository.createMany(newCollaborators);

    const existingPublisher = await this._publisherRepository.getByAddress(
      publisher._address,
    );

    const newVotingRound = VotingRound.create(
      startsAt,
      endsAt,
      existingPublisher || publisher,
      dripListId,
      name,
      description,
      [...existingCollaborators, ...newCollaborators],
      areVotesPrivate,
      nominationStartsAt,
      nominationEndsAt,
    );

    await this._votingRoundRepository.save(newVotingRound);

    await this._setAllowedReceivers(allowedReceiversData, newVotingRound);

    return newVotingRound;
  }

  private async _setAllowedReceivers(
    allowedReceiversData: AllowedReceiverData[] | undefined,
    votingRound: VotingRound,
  ) {
    if (allowedReceiversData?.length) {
      const allowedReceivers = await Promise.all(
        allowedReceiversData.map(async (receiverData) =>
          AllowedReceiver.create(votingRound, receiverData),
        ),
      );

      // Create allowed receivers...
      await this._allowedReceiversRepository.createMany(allowedReceivers);

      // ... and link them to the voting round.
      votingRound._allowedReceivers = allowedReceivers; // eslint-disable-line no-param-reassign
      await this._votingRoundRepository.save(votingRound);
    }
  }
}
