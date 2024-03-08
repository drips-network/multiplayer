import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type VotingRound from './VotingRound';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import BaseEntity from '../BaseEntity';
import type { AccountId } from '../typeUtils';

export type VoteAllocation = {
  receiverId: string;
  weight: number;
};

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

  @Column('json', { nullable: true, name: 'voteAllocations' })
  public _voteAllocationsJson!: string;
  private _voteAllocations!: {
    receiverId: AccountId;
    weight: number;
  }[];
  get voteAllocations(): { receiverId: AccountId; weight: number }[] {
    if (!this._voteAllocations && this._voteAllocationsJson) {
      this._voteAllocations = JSON.parse(this._voteAllocationsJson);
    }
    return this._voteAllocations;
  }
  set voteAllocations(value: { receiverId: AccountId; weight: number }[]) {
    this._voteAllocations = value;
    this._voteAllocationsJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    collaborator: Collaborator,
    voteAllocations: { receiverId: AccountId; weight: number }[],
  ): Vote {
    console.log('💧💧💧💧💧💧 ~ Vote ~ votingRound:', votingRound);
    if (!votingRound) {
      throw new InvalidArgumentError('Invalid votingRound.');
    }

    if (!collaborator) {
      throw new InvalidArgumentError('Invalid collaborator.');
    }

    if (!voteAllocations || !voteAllocations.length) {
      throw new InvalidArgumentError('Invalid voteAllocations.');
    }

    const sum = voteAllocations.reduce((a, b) => a + b.weight, 0);
    if (sum !== 100) {
      throw new InvalidArgumentError('The sum of the weights must be 100.');
    }

    const vote = new Vote();

    vote._votingRound = votingRound;
    vote._collaborator = collaborator;
    vote.voteAllocations = voteAllocations;

    return vote;
  }
}
