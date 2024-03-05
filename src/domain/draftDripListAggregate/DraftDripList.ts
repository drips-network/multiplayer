import { Column, Entity, OneToMany } from 'typeorm';
import { type DripListId } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type IAggregateRoot from '../IAggregateRoot';
import Publisher from './Publisher';
import VotingRound from '../votingRoundAggregate/VotingRound';
import {
  InvalidArgumentError,
  InvalidVotingRoundOperationError,
} from '../errors';

@Entity({
  name: 'DraftDripLists',
})
export default class DraftDripList
  extends BaseEntity
  implements IAggregateRoot
{
  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    nullable: true,
    name: 'publishedDripListId',
  })
  public _publishedDripListId!: DripListId | null;

  @Column('varchar', { length: 50, name: 'name', nullable: false })
  public _name!: string;

  @Column('varchar', { length: 200, name: 'description', nullable: false })
  public _description!: string;

  @Column(() => Publisher, {
    prefix: 'publisher',
  })
  public _publisher!: Publisher;

  @OneToMany(
    'VotingRound',
    (votingRound: VotingRound) => votingRound._draftDripList,
    { nullable: false, orphanedRowAction: 'soft-delete', cascade: true },
  )
  public _votingRounds!: VotingRound[] | null;

  public get isPublished(): boolean {
    return this._publishedDripListId !== null;
  }

  public get currentVotingRound(): VotingRound | null {
    if (!this._votingRounds?.length) {
      return null;
    }

    return this._votingRounds.reduce((a, b) =>
      a._updatedAt.getTime() > b._updatedAt.getTime() ? a : b,
    );
  }

  public static create(
    name: string,
    description: string,
    publisher: Publisher,
  ) {
    if (name?.length === 0 || name?.length > 50) {
      throw new InvalidArgumentError('Invalid name.');
    }

    if (description?.length === 0 || description?.length > 200) {
      throw new InvalidArgumentError('Invalid description.');
    }

    const draftDripList = new DraftDripList();

    draftDripList._name = name;
    draftDripList._description = description;
    draftDripList._publisher = publisher;
    draftDripList._publishedDripListId = null;

    return draftDripList;
  }

  public startVotingRound(startsAt: Date, endsAt: Date): void {
    if (!this._votingRounds?.length) {
      this._votingRounds = [];
    }

    if (
      this._votingRounds.some((votingRound) => votingRound.status === 'started')
    ) {
      throw new InvalidVotingRoundOperationError(
        'Cannot start a new voting round while another is active.',
      );
    }

    this._votingRounds.push(VotingRound.create(startsAt, endsAt));
  }

  public deleteCurrentVotingRound(): void {
    const { currentVotingRound } = this;

    if (!currentVotingRound) {
      throw new InvalidVotingRoundOperationError('No voting round to delete.');
    }

    if (currentVotingRound.status === 'completed') {
      throw new InvalidVotingRoundOperationError(
        'Cannot delete a completed voting round.',
      );
    }

    if (currentVotingRound.status === 'deleted') {
      throw new InvalidVotingRoundOperationError(
        'Voting round already deleted.',
      );
    }

    this._votingRounds?.pop();
  }

  public publishDripList(publishedDripListId: DripListId): void {
    if (this._publishedDripListId !== null) {
      throw new InvalidVotingRoundOperationError(
        'Drip list already published.',
      );
    }

    if (this.currentVotingRound === null) {
      throw new InvalidVotingRoundOperationError(
        'No active voting round to publish a Drip List with.',
      );
    }

    if (this.currentVotingRound.status === 'started') {
      throw new InvalidVotingRoundOperationError(
        'Cannot publish a Drip List with an active voting round.',
      );
    }

    if (this.currentVotingRound.status === 'deleted') {
      throw new InvalidVotingRoundOperationError(
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

  public removeCollaborator(accountId: string): void {
    if (!this.currentVotingRound) {
      throw new InvalidVotingRoundOperationError(
        'No active voting round to remove a collaborator from.',
      );
    }

    if (this.currentVotingRound.status === 'completed') {
      throw new InvalidVotingRoundOperationError(
        'Cannot remove a collaborator from a completed voting round.',
      );
    }

    if (this.currentVotingRound.status === 'deleted') {
      throw new InvalidVotingRoundOperationError(
        'Cannot remove a collaborator from a deleted voting round.',
      );
    }

    const index = this.currentVotingRound._collaborators.findIndex(
      (c) => c._addressId === accountId,
    );

    if (index === -1) {
      throw new InvalidVotingRoundOperationError(
        'Collaborator not found in this voting round.',
      );
    }

    this.currentVotingRound._collaborators.splice(index, 1);
  }
}
