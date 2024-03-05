import type { UUID } from 'crypto';
import type IVotingRoundRepository from '../votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError } from '../../application/errors';
import {
  InvalidArgumentError,
  InvalidVotingRoundOperationError,
} from '../errors';
import { VotingRoundStatus } from '../votingRoundAggregate/VotingRound';
import type ICollaboratorRepository from '../collaboratorAggregate/ICollaboratorRepository';
import type { Address, AddressDriverId } from '../typeUtils';
import Collaborator from '../collaboratorAggregate/Collaborator';

export default class VotingRoundService {
  private readonly _collaboratorRepository: ICollaboratorRepository;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    collaboratorRepository: ICollaboratorRepository,
    votingRoundRepository: IVotingRoundRepository,
  ) {
    this._collaboratorRepository = collaboratorRepository;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async setCollaborators(
    votingRoundId: UUID,
    collaborators: {
      address: Address;
      addressDriverId: AddressDriverId;
    }[],
  ): Promise<void> {
    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`Voting round not found.`);
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
