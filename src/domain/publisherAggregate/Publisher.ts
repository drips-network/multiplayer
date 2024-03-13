import { Column, Entity, OneToMany } from 'typeorm';
import { isAddress } from 'ethers';
import { type Address } from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import { InvalidArgumentError } from '../errors';
import type VotingRound from '../votingRoundAggregate/VotingRound';
import BaseEntity from '../BaseEntity';

@Entity({
  name: 'Publishers',
})
export default class Publisher extends BaseEntity {
  @Column('varchar', {
    nullable: false,
    name: 'address',
    length: DataSchemaConstants.ADDRESS_LENGTH,
  })
  public _address!: Address;

  @OneToMany(
    'VotingRound',
    (votingRound: VotingRound) => votingRound._publisher,
    {
      nullable: true,
    },
  )
  public _votingRounds: VotingRound[] | undefined;

  public static create(address: string) {
    if (!isAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const publisher = new Publisher();

    publisher._address = address as Address;

    return publisher;
  }
}
