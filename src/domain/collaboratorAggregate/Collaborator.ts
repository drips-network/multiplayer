import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type Vote from '../votingRoundAggregate/Vote';
import { InvalidArgumentError } from '../errors';
import type VotingRound from '../votingRoundAggregate/VotingRound';
import {
  isAddressDriverId,
  type Address,
  type AddressDriverId,
  isEthAddress,
} from '../typeUtils';

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

  @OneToMany('Vote', (vote: Vote) => vote._collaborator, {
    nullable: true,
  })
  public _votes: Vote[] | undefined;

  public static create(accountId: string, address: string) {
    if (!isAddressDriverId(accountId)) {
      throw new InvalidArgumentError('Invalid accountId.');
    }

    if (!isEthAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const collaborator = new Collaborator();

    collaborator._addressId = accountId;
    collaborator._address = address;

    return collaborator;
  }
}
