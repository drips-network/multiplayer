import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { isAccountId, isEthAddress } from '../typeUtils';
import type { AccountId, Address } from '../typeUtils';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../DataSchemaConstants';
import type { VotingRound } from './VotingRound';

@Entity({
  name: 'Collaborators',
})
export default class Collaborator extends BaseEntity {
  @ManyToMany('VotingRound')
  @JoinTable({ name: 'CollaboratorVotingRounds' })
  private _votingRounds!: VotingRound[];
  get votingRounds(): VotingRound[] {
    return this._votingRounds;
  }

  @Column('varchar', {
    length: DataSchemaConstants.ACCOUNT_ID_LENGTH,
    nullable: false,
    unique: true,
    name: 'addressId',
  })
  private _addressId!: AccountId;
  get addressId(): AccountId {
    return this._addressId;
  }

  @Column('varchar', {
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    unique: true,
    name: 'address',
  })
  private _address!: Address;
  get address(): Address {
    return this._address;
  }

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
