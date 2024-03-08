import { Column, Entity, OneToMany } from 'typeorm';
import {
  isAddressDriverId,
  type Address,
  type AddressDriverId,
  isAddress,
} from '../typeUtils';
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
    name: 'addressDriverId',
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
  })
  public _addressDriverId!: AddressDriverId;

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

  public static create(address: string, addressDriverId: string) {
    if (!isAddressDriverId(addressDriverId)) {
      throw new InvalidArgumentError('Invalid addressDriverId.');
    }

    if (!isAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const publisher = new Publisher();

    publisher._addressDriverId = addressDriverId;
    publisher._address = address;

    return publisher;
  }
}
