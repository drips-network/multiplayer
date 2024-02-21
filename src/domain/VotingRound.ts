import { Column, Entity, PrimaryColumn } from 'typeorm';
import {
  createVotingRoundId,
  type BigIntString,
  type VotingRoundId,
} from './typeAliasesUtils';

@Entity()
export class VotingRound {
  @PrimaryColumn({
    type: 'uuid',
  })
  public readonly id: VotingRoundId;

  @Column('varchar', { length: 78 })
  public readonly draftDripListId: BigIntString;

  @Column('timestamptz')
  public readonly startsAt: Date;

  @Column('timestamptz')
  public readonly endsAt: Date;

  constructor(startsAt: Date, endsAt: Date, draftDripListId: BigIntString) {
    this.id = createVotingRoundId();
    this.startsAt = startsAt;
    this.endsAt = endsAt;
    this.draftDripListId = draftDripListId;
  }
}
