import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type VotingRound from './VotingRound';
import type Collaborator from '../collaboratorAggregate/Collaborator';
import { InvalidArgumentError } from '../errors';
import BaseEntity from '../BaseEntity';
import type { AccountId } from '../typeUtils';

export type VoteAllocation = {
  receiverId: string;
  percentage: number;
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
    percentage: number;
  }[];
  get voteAllocations(): { receiverId: AccountId; percentage: number }[] {
    if (!this._voteAllocations && this._voteAllocationsJson) {
      this._voteAllocations = JSON.parse(this._voteAllocationsJson);
    }
    return this._voteAllocations;
  }
  set voteAllocations(value: { receiverId: AccountId; percentage: number }[]) {
    this._voteAllocations = value;
    this._voteAllocationsJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    collaborator: Collaborator,
    voteAllocations: { receiverId: AccountId; percentage: number }[],
  ): Vote {
    if (!votingRound) {
      throw new InvalidArgumentError('Invalid votingRound.');
    }

    if (!collaborator) {
      throw new InvalidArgumentError('Invalid collaborator.');
    }

    if (!voteAllocations || !voteAllocations.length) {
      throw new InvalidArgumentError('Invalid voteAllocations.');
    }

    const sum = voteAllocations.reduce((a, b) => a + b.percentage, 0);
    if (sum !== 100) {
      throw new InvalidArgumentError('The sum of the percentages must be 100.');
    }

    const vote = new Vote();

    vote._votingRound = votingRound;
    vote._collaborator = collaborator;
    vote.voteAllocations = voteAllocations;

    return vote;
  }
}
