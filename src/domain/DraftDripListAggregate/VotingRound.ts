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
export default class VotingRound extends BaseEntity {
  @Column('timestamptz')
  public readonly _startsAt: Date;

  @Column('timestamptz')
  public readonly _endsAt: Date;

  @ManyToOne(
    'DraftDripList',
    (draftDripList: DraftDripList) => draftDripList._votingRounds,
    { nullable: false },
  )
  @JoinColumn({
    name: 'draftDripListId',
  })
  public _draftDripList!: DraftDripList;

  @OneToMany(
    'Collaborator',
    (collaborator: Collaborator) => collaborator._votingRounds,
    { nullable: true, orphanedRowAction: 'soft-delete' },
  )
  public _collaborators!: Collaborator[];

  public get status(): VotingRoundStatus {
    if (this.deletedAt) {
      return VotingRoundStatus.Deleted;
    }

    if (this._endsAt.getTime() < new Date().getTime()) {
      return VotingRoundStatus.Completed;
    }

    return VotingRoundStatus.Started;
  }

  public get completedAt(): Date | null {
    if (this.deletedAt) {
      return this.deletedAt;
    }
    if (this._endsAt.getTime() > new Date().getTime()) {
      return null;
    }

    return this._endsAt;
  }

  constructor(startsAt: Date, endsAt: Date) {
    super();

    this._startsAt = startsAt;
    this._endsAt = endsAt;
  }
}
