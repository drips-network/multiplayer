import type { UUID } from 'crypto';
import type IVotingRoundRepository from '../votingRoundAggregate/IVotingRoundRepository';
import { InvalidVotingRoundOperationError } from '../errors';
import type ICollaboratorRepository from '../collaboratorAggregate/ICollaboratorRepository';
import type { DripListId } from '../typeUtils';
import Collaborator from '../collaboratorAggregate/Collaborator';
import VotingRound from '../votingRoundAggregate/VotingRound';
import type Publisher from '../publisherAggregate/Publisher';
import type IPublisherRepository from '../publisherAggregate/IPublisherRepository';

export default class VotingRoundService {
  private readonly _publisherRepository: IPublisherRepository;
  private readonly _votingRoundRepository: IVotingRoundRepository;
  private readonly _collaboratorRepository: ICollaboratorRepository;

  public constructor(
    publisherRepository: IPublisherRepository,
    votingRoundRepository: IVotingRoundRepository,
    collaboratorRepository: ICollaboratorRepository,
  ) {
    this._publisherRepository = publisherRepository;
    this._votingRoundRepository = votingRoundRepository;
    this._collaboratorRepository = collaboratorRepository;
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
  ): Promise<UUID> {
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

    return newVotingRound._id;
  }
}
