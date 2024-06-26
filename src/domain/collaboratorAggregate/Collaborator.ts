import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { isAddress } from 'ethers';
import BaseEntity from '../BaseEntity';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type Vote from '../votingRoundAggregate/Vote';
import type VotingRound from '../votingRoundAggregate/VotingRound';
import { type Address } from '../typeUtils';
import { InvalidArgumentError } from '../errors';

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

  public static create(address: Address) {
    if (!isAddress(address)) {
      throw new InvalidArgumentError('Invalid address.');
    }

    const collaborator = new Collaborator();

    collaborator._address = address;

    return collaborator;
  }
}
