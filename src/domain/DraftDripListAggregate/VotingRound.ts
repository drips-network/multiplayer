/* eslint-disable dot-notation */

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import BaseEntity from '../BaseEntity';
import type { DraftDripList } from './DraftDripList';
import type Collaborator from './Collaborator';

export enum VotingRoundStatus {
  Started = 'started',
  Completed = 'completed',
  Deleted = 'deleted',
}

@Entity({
  name: 'VotingRounds',
})
export class VotingRound extends BaseEntity {
  @Column('timestamptz')
  public readonly startsAt: Date;

  @Column('timestamptz')
  public readonly endsAt: Date;

  @ManyToOne(
    'DraftDripList',
    (draftDripList: DraftDripList) => draftDripList['_votingRounds'],
    { nullable: false },
  )
  @JoinColumn({
    name: 'draftDripListId',
  })
  private _draftDripList!: DraftDripList;
  public get draftDripList(): DraftDripList {
    return this._draftDripList;
  }

  @OneToMany(
    'Collaborator',
    (collaborator: Collaborator) => collaborator['_votingRounds'],
    { nullable: true, orphanedRowAction: 'soft-delete' },
  )
  private _collaborators!: Collaborator[];
  public get collaborators(): Collaborator[] {
    return this._collaborators;
  }

  public get status(): VotingRoundStatus {
    if (this.deletedAt) {
      return VotingRoundStatus.Deleted;
    }

    if (this.endsAt.getTime() < new Date().getTime()) {
      return VotingRoundStatus.Completed;
    }

    return VotingRoundStatus.Started;
  }

  public get completedAt(): Date | null {
    if (this.deletedAt) {
      return this.deletedAt;
    }
    if (this.endsAt.getTime() > new Date().getTime()) {
      return null;
    }

    return this.endsAt;
  }

  constructor(startsAt: Date, endsAt: Date) {
    super();

    this.startsAt = startsAt;
    this.endsAt = endsAt;
  }
}
