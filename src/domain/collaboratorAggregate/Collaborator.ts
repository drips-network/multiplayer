import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { isAddressDriverId, isEthAddress } from '../typeUtils';
import type { Address, AddressDriverId } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type VotingRound from '../votingRoundAggregate/VotingRound';

@Entity({
  name: 'Collaborators',
})
export default class Collaborator extends BaseEntity {
  @ManyToMany(
    'VotingRound',
    (votingRound: VotingRound) => votingRound._collaborators,
  )
  @JoinTable({ name: 'CollaboratorVotingRounds' })
  public _votingRounds!: VotingRound[];

  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    nullable: false,
    unique: true,
    name: 'addressDriverId',
  })
  public _addressId!: AddressDriverId;

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    unique: true,
    name: 'address',
  })
  public _address!: Address;

  public constructor() {
    super();
  }

  public static create(accountId: string, address: string) {
    if (!isAddressDriverId(accountId)) {
      throw new Error('Invalid accountId');
    }

    if (!isEthAddress(address)) {
      throw new Error('Invalid address');
    }

    const collaborator = new Collaborator();

    collaborator._addressId = accountId;
    collaborator._address = address;

    return collaborator;
  }
}
