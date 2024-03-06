import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import BaseEntity from '../BaseEntity';
import type DraftDripList from '../draftDripListAggregate/DraftDripList';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import type IAggregateRoot from '../IAggregateRoot';
import Vote from './Vote';
import type { AddressDriverId } from '../typeUtils';
import { toAddressDriverId } from '../typeUtils';

export enum VotingRoundStatus {
  Started = 'started',
  Completed = 'completed',
  Deleted = 'deleted',
}

@Entity({
  name: 'VotingRounds',
})
export default class VotingRound extends BaseEntity implements IAggregateRoot {
  @Column('timestamptz', { nullable: false, name: 'startsAt' })
  public _startsAt!: Date;

  @Column('timestamptz', { nullable: false, name: 'endsAt' })
  public _endsAt!: Date;

  @ManyToOne(
    'DraftDripList',
    (draftDripList: DraftDripList) => draftDripList._votingRounds,
    { nullable: false, orphanedRowAction: 'soft-delete' },
  )
  @JoinColumn({
    name: 'draftDripListId',
  })
  public _draftDripList!: DraftDripList;

  @ManyToMany(
    'Collaborator',
    (collaborator: Collaborator) => collaborator._votingRounds,
    { nullable: true, orphanedRowAction: 'soft-delete', cascade: true },
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

  public get completedAt(): Date | null {
    if (this._deletedAt) {
      return this._deletedAt;
    }
    if (this._endsAt.getTime() > new Date().getTime()) {
      return null;
    }

    return this._endsAt;
  }

  public static create(startsAt: Date, endsAt: Date): VotingRound {
    const startsAtTime = new Date(startsAt).getTime();
    const endsAtTime = new Date(endsAt).getTime();

    if (startsAtTime > endsAtTime) {
      throw new InvalidArgumentError('Start date must be before end date.');
    }

    if (startsAtTime < new Date().getTime()) {
      throw new InvalidArgumentError('Start date must be in the future.');
    }

    if (endsAtTime < new Date().getTime()) {
      throw new InvalidArgumentError('End date must be in the future.');
    }

    const votingRound = new VotingRound();

    votingRound._startsAt = startsAt;
    votingRound._endsAt = endsAt;

    return votingRound;
  }

  /**
   * Do not use this method directly. Use `VotingRoundService.setCollaborators` instead.
   */
  public setCollaborators(collaborators: Collaborator[]): void {
    if (!collaborators?.length) {
      throw new InvalidArgumentError('Collaborators cannot be empty.');
    }

    this._collaborators = collaborators;
  }

  public castVote(
    collaborator: Collaborator,
    voteAllocations: { receiverId: string; percentage: number }[],
  ): void {
    if (
      !this._collaborators?.find(
        (c) => c._addressId === collaborator._addressId,
      )
    ) {
      throw new InvalidArgumentError(
        'Collaborator is not part of the voting round.',
      );
    }

    const vote = Vote.create(
      this,
      collaborator,
      voteAllocations.map((va) => ({
        receiverId: toAddressDriverId(va.receiverId),
        percentage: va.percentage,
      })),
    );

    if (!this._votes) {
      this._votes = [];
    }

    this._votes.push(vote);
  }

  public getCollaboratorsWithVotes(): {
    collaborator: Collaborator;
    latestVote: Vote | null;
  }[] {
    const collaboratorVotes: {
      collaborator: Collaborator;
      latestVote: Vote | null;
    }[] =
      this._collaborators?.map(
        (collaborator) => ({ collaborator, latestVote: null }), // Initialize with null for no votes
      ) || [];

    if (this._votes?.length) {
      this._votes.sort(
        (a, b) => b._updatedAt.getTime() - a._updatedAt.getTime(),
      );

      const latestVoteMap = new Map<AddressDriverId, Vote>();

      this._votes.forEach((vote) => {
        const collaboratorAddressId = vote._collaborator._addressId;
        if (!latestVoteMap.has(collaboratorAddressId)) {
          latestVoteMap.set(collaboratorAddressId, vote);
        }
      });

      collaboratorVotes.forEach((cv) => {
        const latestVote = latestVoteMap.get(cv.collaborator._addressId);
        // eslint-disable-next-line no-param-reassign
        cv.latestVote = latestVote || null;
      });
    }

    return collaboratorVotes;
  }
}
