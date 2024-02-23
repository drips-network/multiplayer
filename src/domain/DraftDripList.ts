import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import type { UUID } from 'crypto';
import { randomUUID } from 'crypto';
import type { DripListId } from './typeUtils';
import type Collaborator from './Collaborator';

@Entity()
export class DraftDripList {
  @PrimaryColumn({
    type: 'uuid',
  })
  public readonly id: UUID;

  @Column('varchar', {
    length: 78,
    nullable: true,
    name: 'publishedDripListId',
  })
  private _publishedDripListId: DripListId | null;
  get publishedDripListId(): DripListId | null {
    return this._publishedDripListId;
  }

  @Column('varchar', { length: 50, name: 'name' })
  private _name: string;
  get name(): string {
    return this._name;
  }

  @Column('varchar', { length: 200, name: 'description' })
  private _description: string;
  get description(): string {
    return this._description;
  }

  @OneToMany(
    'Collaborator', // Needs to be a string to avoid circular dependency.
    (collaborator: Collaborator) => collaborator.draftDripList,
  )
  private _collaborators!: Collaborator[];
  get collaborators(): Collaborator[] {
    return this._collaborators;
  }

  constructor(name: string, description: string) {
    this.id = randomUUID();
    this._name = name;
    this._description = description;
    this._publishedDripListId = null;
  }

  public setPublishedDripListId(publishedDripListId: DripListId) {
    this._publishedDripListId = publishedDripListId;
  }

  public updateCollaborators() {
    throw new Error('Not implemented');
  }

  public updateDraftDripList(name?: string, description?: string) {
    this._name = name ?? this._name;
    this._description = description ?? this._description;
  }
}
