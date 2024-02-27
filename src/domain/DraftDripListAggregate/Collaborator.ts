import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { isAccountId, isEthAddress } from '../typeUtils';
import type { AccountId, Address } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../DataSchemaConstants';
import type VotingRound from './VotingRound';

@Entity({
  name: 'Collaborators',
})
export default class Collaborator extends BaseEntity {
  @ManyToMany('VotingRound')
  @JoinTable({ name: 'CollaboratorVotingRounds' })
  public _votingRounds!: VotingRound[];

  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_LENGTH,
    nullable: false,
    unique: true,
    name: 'addressId',
  })
  public _addressId!: AccountId;

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

  public static new(accountId: string, address: string) {
    if (!isAccountId(accountId)) {
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
