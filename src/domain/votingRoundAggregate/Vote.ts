import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import BaseEntity from '../BaseEntity';
import type { AccountId } from '../typeUtils';
import { TOTAL_VOTE_WEIGHT } from '../constants';
import type VotingRound from './VotingRound';

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

  @ManyToOne(
    'Collaborator',
    (collaborator: Collaborator) => collaborator._votes,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'collaboratorId',
  })
  public _collaborator!: Collaborator;

  @Column('json', { nullable: true, name: 'receivers' })
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
    collaborator: Collaborator,
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

    const sum = receivers.reduce((a, b) => {
      if (typeof b.weight === 'number' && Number.isInteger(b.weight)) {
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
    vote.receivers = receivers;

    return vote;
  }
}
