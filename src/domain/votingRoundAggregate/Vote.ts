import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { InvalidArgumentError } from '../errors';
import BaseEntity from '../BaseEntity';
import type { AccountId, Address } from '../typeUtils';
import { TOTAL_VOTE_WEIGHT } from '../constants';
import type VotingRound from './VotingRound';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';

export type AddressReceiver = {
  address: string;
  accountId: AccountId;
  weight: number;
  type: 'address';
};

export type ProjectReceiver = {
  url: string;
  accountId: AccountId;
  weight: number;
  type: 'project';
};

export type DripListReceiver = {
  accountId: AccountId;
  weight: number;
  type: 'dripList';
};

export type Receiver = AddressReceiver | ProjectReceiver | DripListReceiver;

@Entity({
  name: 'Votes',
})
export default class Vote extends BaseEntity {
  @ManyToOne('VotingRound', (votingRound: VotingRound) => votingRound._votes, {
    nullable: false,
  })
  @JoinColumn({
    name: 'votingRoundId',
  })
  public _votingRound!: VotingRound;

  @Column({
    length: DataSchemaConstants.ADDRESS_LENGTH,
    nullable: false,
    name: 'collaborator',
  })
  public _collaborator!: Address;

  @Column('json', { nullable: false, name: 'receivers' })
  public _receiversJson!: string;
  private _receivers!: Receiver[];
  get receivers(): Receiver[] {
    if (!this._receivers && this._receiversJson) {
      this._receivers = JSON.parse(this._receiversJson);
    }
    return this._receivers;
  }
  set receivers(value: Receiver[]) {
    this._receivers = value;
    this._receiversJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    collaborator: Address,
    receivers: Receiver[],
  ): Vote {
    if (!votingRound) {
      throw new InvalidArgumentError('Invalid votingRound.');
    }

    if (!collaborator) {
      throw new InvalidArgumentError('Invalid collaborator.');
    }

    if (!receivers || !receivers.length) {
      throw new InvalidArgumentError('Invalid receivers.');
    }

    if (votingRound._allowedReceivers?.length) {
      const allowedReceiverAccountIds = votingRound._allowedReceivers.map(
        (allowedReceiver) => allowedReceiver.receiverData.accountId,
      );

      const receiverAccountIds = receivers.map(
        (receiver) => receiver.accountId,
      );

      if (
        !receiverAccountIds.every((receiverAccountId) =>
          allowedReceiverAccountIds.includes(receiverAccountId),
        )
      ) {
        throw new InvalidArgumentError(
          'Receiver is not specified in allowed receivers.',
        );
      }
    }

    const sum = receivers.reduce((a, b) => {
      if (
        !(
          typeof b.weight === 'number' &&
          Number.isInteger(b.weight) &&
          b.weight > 0
        )
      ) {
        throw new InvalidArgumentError('Invalid weight.');
      }

      return a + Number(b.weight);
    }, 0);

    if (sum !== TOTAL_VOTE_WEIGHT) {
      throw new InvalidArgumentError(
        `The sum of the weights must be ${TOTAL_VOTE_WEIGHT}.`,
      );
    }

    const vote = new Vote();

    vote._votingRound = votingRound;
    vote._collaborator = collaborator;
    vote.receivers = receivers; // Not `_receivers` because we want to use the setter.

    return vote;
  }
}
