import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import type { UUID } from 'crypto';
import { type DripListId } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../DataSchemaConstants';
import Collaborator from './Collaborator';
import type IAggregateRoot from '../IAggregateRoot';
import type Publisher from './Publisher';
import VotingRound from './VotingRound';

@Entity({
  name: 'DraftDripLists',
})
export class DraftDripList extends BaseEntity implements IAggregateRoot {
  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_LENGTH,
    nullable: true,
    name: 'publishedDripListId',
  })
  public _publishedDripListId!: DripListId | null;

  @Column('varchar', { length: 50, name: 'name', nullable: false })
  public _name!: string;

  @Column('varchar', { length: 200, name: 'description', nullable: false })
  public _description!: string;

  @ManyToOne('Publisher', { nullable: false, cascade: true })
  @JoinColumn({ name: 'publisherId' })
  public _publisher!: Publisher;

  @OneToMany(
    'VotingRound',
    (votingRound: VotingRound) => votingRound._draftDripList,
    { nullable: true, orphanedRowAction: 'soft-delete' },
  )
  public _votingRounds!: VotingRound[];

  public get isPublished(): boolean {
    return this._publishedDripListId !== null;
  }

  public get currentVotingRound(): VotingRound | null {
    return this._votingRounds[this._votingRounds.length - 1] || null;
  }

  public static new(name: string, description: string, publisher: Publisher) {
    if (name?.length === 0 || name?.length > 50) {
      throw new Error('Invalid name.');
    }

    if (description?.length === 0 || description?.length > 200) {
      throw new Error('Invalid description.');
    }

    const draftDripList = new DraftDripList();

    draftDripList._name = name;
    draftDripList._description = description;
    draftDripList._publisher = publisher;
    draftDripList._publishedDripListId = null;

    return draftDripList;
  }

  public startVotingRound(startsAt: Date, endsAt: Date): void {
    if (
      this._votingRounds.some((votingRound) => votingRound.status === 'started')
    ) {
      throw new Error('A voting round is already started for this Drip List.');
    }

    this._votingRounds.push(new VotingRound(startsAt, endsAt));
  }

  public deleteCurrentVotingRound(): UUID | null {
    const { currentVotingRound } = this;

    const index = this._votingRounds.findIndex(
      (vr) => vr.id === currentVotingRound?.id,
    );

    if (index === -1) {
      throw new Error('No voting round to delete.');
    }

    if (this._votingRounds[index].status === 'completed') {
      throw new Error('Cannot delete a completed voting round.');
    }

    if (this._votingRounds[index].status === 'deleted') {
      throw new Error('Voting round already deleted.');
    }

    return this._votingRounds.pop()?.id || null;
  }

  public publishDripList(publishedDripListId: DripListId): void {
    if (this._publishedDripListId !== null) {
      throw new Error('Drip list already published.');
    }

    if (this.currentVotingRound === null) {
      throw new Error('No active voting round to publish a Drip List with.');
    }

    if (this.currentVotingRound.status === 'started') {
      throw new Error(
        'Cannot publish a Drip List with an active voting round.',
      );
    }

    if (this.currentVotingRound.status === 'deleted') {
      throw new Error(
        'Cannot publish a Drip List with a deleted voting round.',
      );
    }

    if (this.currentVotingRound.status === 'completed') {
      this._publishedDripListId = publishedDripListId;
    }
  }

  public updateDraftDripListInfo(name?: string, description?: string): void {
    this._name = name ?? this._name;
    this._description = description ?? this._description;
  }

  public addCollaborator(accountId: string, address: string): void {
    if (!this.currentVotingRound) {
      throw new Error('No active voting round to add a collaborator to.');
    }

    if (this.currentVotingRound.status !== 'started') {
      throw new Error('Cannot add a collaborator to a completed voting round.');
    }

    this.currentVotingRound._collaborators.push(
      Collaborator.new(accountId, address),
    );
  }

  public removeCollaborator(accountId: string): void {
    if (!this.currentVotingRound) {
      throw new Error('No active voting round to remove a collaborator from.');
    }

    if (this.currentVotingRound.status === 'completed') {
      throw new Error(
        'Cannot remove a collaborator from a completed voting round.',
      );
    }

    if (this.currentVotingRound.status === 'deleted') {
      throw new Error(
        'Cannot remove a collaborator from a deleted voting round.',
      );
    }

    const index = this.currentVotingRound._collaborators.findIndex(
      (c) => c._addressId === accountId,
    );

    if (index === -1) {
      throw new Error('Collaborator not found in this voting round.');
    }

    this.currentVotingRound._collaborators.splice(index, 1);
  }
}
