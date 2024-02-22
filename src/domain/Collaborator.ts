import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import type { UUID } from 'crypto';
import { randomUUID } from 'crypto';
import type { DraftDripList } from './DraftDripList';
import type { Address } from './typeUtils';

@Entity()
export default class Collaborator {
  @PrimaryColumn({
    type: 'uuid',
  })
  public readonly id: UUID;

  @ManyToOne(
    'DraftDripList', // Needs to be a string to avoid circular dependency.
    (draftDripList: DraftDripList) => draftDripList.collaborators,
  )
  public readonly draftDripList: DraftDripList;

  @Column('varchar', { length: 42 })
  public readonly address: Address;

  constructor(draftDripList: DraftDripList, address: Address) {
    this.id = randomUUID();
    this.draftDripList = draftDripList;
    this.address = address;
  }
}
