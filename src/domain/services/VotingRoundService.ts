import type { UUID } from 'crypto';
import type IVotingRoundRepository from '../votingRoundAggregate/IVotingRoundRepository';
import {
  InvalidArgumentError,
  InvalidVotingRoundOperationError,
} from '../errors';
import type ICollaboratorRepository from '../collaboratorAggregate/ICollaboratorRepository';
import type {
  Address,
  AddressDriverId,
  VotingRoundDripListId,
} from '../typeUtils';
import Collaborator from '../collaboratorAggregate/Collaborator';
import VotingRound, {
  VotingRoundStatus,
} from '../votingRoundAggregate/VotingRound';
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
    dripListId: VotingRoundDripListId,
    startsAt: Date,
    endsAt: Date,
    name: string,
    description: string,
    publisher: Publisher,
  ): Promise<UUID> {
    const existingVotingRound = await this._votingRoundRepository.existsBy(
      dripListId,
      publisher,
    );

    if (existingVotingRound) {
      throw new InvalidVotingRoundOperationError(
        `A voting round is already in progress.`,
      );
    }

    const existingPublisher = await this._publisherRepository.getByAddress(
      publisher._address,
    );

    const newVotingRound = VotingRound.create(
      startsAt,
      endsAt,
      dripListId,
      name,
      description,
      existingPublisher || publisher,
    );

    await this._votingRoundRepository.save(newVotingRound);

    return newVotingRound._id;
  }

  public async setCollaborators(
    publisherAddress: Address,
    votingRound: VotingRound,
    collaborators: {
      address: Address;
      addressDriverId: AddressDriverId;
    }[],
  ): Promise<void> {
    if (votingRound._publisher._address !== publisherAddress) {
      throw new InvalidVotingRoundOperationError(
        `Voting round with ID '${votingRound._id}' does not belong to the publisher with address '${publisherAddress}'.`,
      );
    }

    if (votingRound.status !== VotingRoundStatus.Started) {
      throw new InvalidVotingRoundOperationError(
        `Collaborators can only be set for a voting round that is in the 'Started' status but the voting round is in the '${votingRound.status}' status.`,
      );
    }

    if (votingRound._collaborators?.length) {
      throw new InvalidVotingRoundOperationError(
        `Collaborators can only be set for a voting round that has no collaborators but the voting round already has collaborators.`,
      );
    }

    const seen = new Set();
    for (const item of collaborators) {
      const uniqueKey = `${item.address}-${item.addressDriverId}`;
      if (seen.has(uniqueKey)) {
        throw new InvalidArgumentError(
          `Collaborators cannot contain duplicates.`,
        );
      }
      seen.add(uniqueKey);
    }

    const existingCollaborators = await this._collaboratorRepository.getMany(
      collaborators.map((c) => ({
        address: c.address,
        addressDriverId: c.addressDriverId,
      })),
    );

    const newCollaborators = collaborators
      .filter(
        (c) =>
          !existingCollaborators.some(
            (e) =>
              e._address === c.address && e._addressId === c.addressDriverId,
          ),
      )
      .map((c) => Collaborator.create(c.addressDriverId, c.address));

    await this._collaboratorRepository.createMany(newCollaborators);

    votingRound.setCollaborators([
      ...existingCollaborators,
      ...newCollaborators,
    ]);

    await this._votingRoundRepository.save(votingRound);
  }
}
