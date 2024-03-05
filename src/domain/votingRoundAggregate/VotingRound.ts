import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import BaseEntity from '../BaseEntity';
import type DraftDripList from '../draftDripListAggregate/DraftDripList';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import type IAggregateRoot from '../IAggregateRoot';

export enum VotingRoundStatus {
  Started = 'started',
  Completed = 'completed',
  Deleted = 'deleted',
}

@Entity({
  name: 'VotingRounds',
})
export default class VotingRound extends BaseEntity implements IAggregateRoot {
  @Column('timestamptz', { name: 'startsAt' })
  public _startsAt!: Date;

  @Column('timestamptz', { name: 'endsAt' })
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
  public _collaborators!: Collaborator[];

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
      throw new Error('Start date must be before end date.');
    }

    if (startsAtTime < new Date().getTime()) {
      throw new Error('Start date must be in the future.');
    }

    if (endsAtTime < new Date().getTime()) {
      throw new Error('End date must be in the future.');
    }

    const votingRound = new VotingRound();

    votingRound._startsAt = startsAt;
    votingRound._endsAt = endsAt;

    return votingRound;
  }

  public setCollaborators(collaborators: Collaborator[]): void {
    if (!collaborators?.length) {
      throw new InvalidArgumentError('Collaborators cannot be empty.');
    }

    this._collaborators = collaborators;
  }
}
