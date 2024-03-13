import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { isAddress } from 'ethers';
import BaseEntity from '../BaseEntity';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import type IAggregateRoot from '../IAggregateRoot';
import type { Receiver } from './Vote';
import Vote from './Vote';
import {
  type AccountId,
  type AddressDriverId,
  type DripListId,
} from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type Publisher from '../publisherAggregate/Publisher';
import Link from '../linkedDripList/Link';

export enum VotingRoundStatus {
  Started = 'started',
  Completed = 'completed',
  Deleted = 'deleted',
}

@Entity({
  name: 'VotingRounds',
})
export default class VotingRound extends BaseEntity implements IAggregateRoot {
  @Column('timestamptz', { nullable: true, name: 'startsAt' })
  public _startsAt!: Date;

  @Column('timestamptz', { nullable: true, name: 'endsAt' })
  public _endsAt!: Date;

  @ManyToOne('Publisher', (publisher: Publisher) => publisher._votingRounds, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({
    name: 'publisherId',
  })
  public _publisher!: Publisher;

  @Column('varchar', {
    nullable: true,
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    name: 'dripListId',
  })
  public _dripListId: DripListId | undefined;

  @Column('varchar', { nullable: true, length: 50, name: 'name' })
  public _name: string | undefined;

  @Column('varchar', { nullable: true, length: 200, name: 'description' })
  public _description: string | undefined;

  @ManyToMany(
    'Collaborator',
    (collaborator: Collaborator) => collaborator._votingRounds,
    {
      nullable: true,
      orphanedRowAction: 'soft-delete',
      cascade: ['insert', 'update'],
    },
  )
  public _collaborators: Collaborator[] | undefined;

  @OneToMany('Vote', (vote: Vote) => vote._votingRound, {
    nullable: true,
    cascade: true,
  })
  public _votes: Vote[] | undefined;

  public get status(): VotingRoundStatus {
    if (this._deletedAt) {
      return VotingRoundStatus.Deleted;
    }

    if (this._endsAt.getTime() < new Date().getTime()) {
      return VotingRoundStatus.Completed;
    }

    return VotingRoundStatus.Started;
  }

  @OneToOne('Link', (link: Link) => link._votingRound, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  public _link: Link | undefined;

  public get isCompleted(): boolean {
    return Boolean(this.status === VotingRoundStatus.Completed);
  }

  public static create(
    endsAt: Date,
    publisher: Publisher,
    dripListId: DripListId | undefined,
    name: string | undefined,
    description: string | undefined,
    collaborators: Collaborator[],
  ): VotingRound {
    const startsAt = new Date(); // For now, all Voting Rounds start immediately.
    const startsAtTime = startsAt.getTime();
    const endsAtTime = new Date(endsAt).getTime();

    if (startsAtTime > endsAtTime) {
      throw new InvalidArgumentError('Start date must be before end date.');
    }

    // TODO: Uncomment this after adding scheduled voting round feature.
    // if (startsAtTime < new Date().getTime()) {
    //   throw new InvalidArgumentError('Start date must be in the future.');
    // }

    if (endsAtTime < new Date().getTime()) {
      throw new InvalidArgumentError('End date must be in the future.');
    }

    if (name?.length && name.length > 50) {
      throw new InvalidArgumentError(
        'Name must be between 1 and 50 characters long.',
      );
    }

    if (description?.length && description.length > 200) {
      throw new InvalidArgumentError(
        'Description must be between 1 and 200 characters long.',
      );
    }

    if (name && !description) {
      throw new InvalidArgumentError('Description must be provided.');
    }

    if (description && !name) {
      throw new InvalidArgumentError('Name must be provided.');
    }

    if (name && description && dripListId) {
      throw new InvalidArgumentError(
        'You can provide either a Drip List id or a name and description, but not both.',
      );
    }

    const seen = new Set();
    for (const item of collaborators) {
      const uniqueKey = `${item._address}-${item._addressDriverId}`;
      if (seen.has(uniqueKey)) {
        throw new InvalidArgumentError(
          `Collaborators cannot contain duplicates.`,
        );
      }
      seen.add(uniqueKey);
    }

    const votingRound = new VotingRound();

    votingRound._startsAt = startsAt;
    votingRound._endsAt = endsAt;
    votingRound._publisher = publisher;
    votingRound._dripListId = dripListId;
    votingRound._name = name;
    votingRound._description = description;
    votingRound._collaborators = collaborators;

    return votingRound;
  }

  public castVote(collaborator: Collaborator, receivers: Receiver[]): void {
    if (
      !this._collaborators?.find(
        (c) => c._addressDriverId === collaborator._addressDriverId,
      )
    ) {
      throw new InvalidArgumentError(
        'Collaborator is not part of the voting round.',
      );
    }

    if (receivers.length > 200) {
      throw new InvalidArgumentError(
        'A maximum of 200 vote allocations can be added to a voting round.',
      );
    }

    if (receivers.reduce((sum, receiver) => sum + receiver.weight, 0) !== 100) {
      throw new InvalidArgumentError(
        'The sum of the weights must be 100 for each vote allocation.',
      );
    }

    receivers.forEach((receiver) => {
      if (receiver.type === 'address') {
        if (!isAddress(receiver.address)) {
          throw new InvalidArgumentError(
            'Address must be provided for address type receiver.',
          );
        }
      }

      if (receiver.type === 'project') {
        if (!receiver.url) {
          throw new InvalidArgumentError(
            'URL must be provided for project type receiver.',
          );
        }
      }
    });

    const vote = Vote.create(this, collaborator, receivers);

    if (!this._votes) {
      this._votes = [];
    }

    this._votes.push(vote);
  }

  public getLatestVotes(): {
    collaborator: Collaborator;
    latestVote: Vote | null;
  }[] {
    const collaboratorVotes: {
      collaborator: Collaborator;
      latestVote: Vote | null;
    }[] =
      this._collaborators?.map((collaborator) => ({
        collaborator,
        latestVote: null,
      })) || [];

    if (this._votes?.length) {
      this._votes.sort(
        (a, b) => b._updatedAt.getTime() - a._updatedAt.getTime(),
      );

      const latestVoteMap = new Map<AddressDriverId, Vote>();

      this._votes.forEach((vote) => {
        const collaboratorAddressId = vote._collaborator._addressDriverId;
        if (!latestVoteMap.has(collaboratorAddressId)) {
          latestVoteMap.set(collaboratorAddressId, vote);
        }
      });

      collaboratorVotes.forEach((cv) => {
        const latestVote = latestVoteMap.get(cv.collaborator._addressDriverId);
        // eslint-disable-next-line no-param-reassign
        cv.latestVote = latestVote || null;
      });
    }

    return collaboratorVotes;
  }

  public getResult(): Receiver[] {
    const latestVotes = this.getLatestVotes() || [];

    // Initialize to keep track of detailed receiver information along with vote counts and weight sums.
    const receiverDetails: Record<
      AccountId,
      Receiver & { voteCount: number; averageWeight: number }
    > = {};

    latestVotes.forEach((vote) =>
      vote.latestVote?.receivers?.forEach((receiver) => {
        const { accountId, weight } = receiver;

        if (!receiverDetails[accountId]) {
          // Initialize with the first occurrence of the receiver, preserving original receiver details.
          receiverDetails[accountId] = {
            ...receiver,
            voteCount: 0,
            averageWeight: 0,
          };
        }

        receiverDetails[accountId].voteCount += 1;
        receiverDetails[accountId].averageWeight += weight;
      }),
    );

    // Calculate the average weight for each accountId.
    Object.keys(receiverDetails).forEach((accountId) => {
      const details = receiverDetails[accountId as AccountId];
      details.averageWeight /= details.voteCount; // Finalize average weight calculation
    });

    // Convert to array, exclude receivers with 0 averageWeight, and sort by averageWeight then by voteCount.
    let receivers = Object.values(receiverDetails)
      .filter(({ averageWeight }) => averageWeight > 0) // Exclude receivers with 0 average weight
      .sort(
        (a, b) =>
          b.averageWeight - a.averageWeight || b.voteCount - a.voteCount,
      );

    // Handle ties for more than 200 receivers.
    if (receivers.length > 200) {
      const cutoffWeight = receivers[199].averageWeight;
      const cutoffVoteCount = receivers[199].voteCount;

      const firstRemovableIndex = receivers.findIndex(
        (r, index) =>
          index > 199 &&
          (r.averageWeight < cutoffWeight || r.voteCount < cutoffVoteCount),
      );

      receivers =
        firstRemovableIndex === -1
          ? receivers.slice(0, 200)
          : receivers.slice(0, firstRemovableIndex);
    }

    // Return receivers with their original properties.
    return receivers.map(
      ({ averageWeight, voteCount: _voteCount, ...receiver }) => ({
        ...receiver,
        weight: averageWeight,
      }),
    );
  }

  public link(): void {
    if (!this._dripListId) {
      throw new InvalidArgumentError('Drip List ID must be provided.');
    }

    if (this._link) {
      throw new InvalidArgumentError(
        'Cannot link a Voting Round that is already linked.',
      );
    }

    if (this.status !== VotingRoundStatus.Completed) {
      throw new InvalidArgumentError(
        `Cannot link a Voting Round that is not completed. Status: ${this.status}.`,
      );
    }

    if (!this._votes?.length) {
      throw new InvalidArgumentError(
        'Cannot link a Drip List to a Voting Round with no votes.',
      );
    }

    const link = Link.create(this._dripListId, this);

    this._link = link;
  }
}