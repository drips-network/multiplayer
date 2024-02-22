import { Column, Entity, PrimaryColumn } from 'typeorm';
import { randomUUID, type UUID } from 'crypto';
import { type BigIntString } from './typeUtils';

@Entity()
export class VotingRound {
  @PrimaryColumn({
    type: 'uuid',
  })
  public readonly id: UUID;

  @Column('varchar', { length: 78 })
  public readonly draftDripListId: BigIntString;

  @Column('timestamptz')
  public readonly startsAt: Date;

  @Column('timestamptz')
  public readonly endsAt: Date;

  constructor(startsAt: Date, endsAt: Date, draftDripListId: BigIntString) {
    this.id = randomUUID();
    this.startsAt = startsAt;
    this.endsAt = endsAt;
    this.draftDripListId = draftDripListId;
  }
}
