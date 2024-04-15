import { Column, Entity, OneToOne } from 'typeorm';
import type IAggregateRoot from '../IAggregateRoot';
import type { DripListId } from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import BaseEntity from '../BaseEntity';
import type VotingRound from '../votingRoundAggregate/VotingRound';

@Entity({
  name: 'Links',
})
export default class Link extends BaseEntity implements IAggregateRoot {
  @Column('varchar', {
    nullable: true,
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    name: 'dripListId',
  })
  public _dripListId!: DripListId;

  @OneToOne('VotingRound', (votingRound: VotingRound) => votingRound._link, {
    nullable: false,
  })
  public _votingRound!: VotingRound;

  // create a property for a transaction hash
  @Column('varchar', {
    nullable: true,
    length: DataSchemaConstants.TRANSACTION_HASH_LENGTH,
    name: 'safeTransactionHash',
  })
  public _safeTransactionHash: string | undefined;

  public static create(
    dripListId: DripListId,
    votingRound: VotingRound,
    safeTransactionHash: string | undefined,
  ): Link {
    const link = new Link();

    link._dripListId = dripListId;
    link._votingRound = votingRound;
    link._safeTransactionHash = safeTransactionHash;

    return link;
  }
}
