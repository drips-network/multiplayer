import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from '../BaseEntity';
import type VotingRound from './VotingRound';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from './Vote';

export type AddressNominationReceiver = Omit<AddressReceiver, 'weight'>;
export type ProjectNominationReceiver = Omit<ProjectReceiver, 'weight'>;
export type DripListNominationReceiver = Omit<DripListReceiver, 'weight'>;

export type NominationReceiver =
  | AddressNominationReceiver
  | ProjectNominationReceiver
  | DripListNominationReceiver;

export enum NominationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

@Entity({
  name: 'Nominations',
})
export default class Nomination extends BaseEntity {
  @ManyToOne('VotingRound', (votingRound: VotingRound) => votingRound._votes, {
    nullable: false,
  })
  @JoinColumn({
    name: 'votingRoundId',
  })
  public _votingRound!: VotingRound;

  @Column('enum', {
    nullable: false,
    name: 'status',
    enum: NominationStatus,
  })
  public _status!: NominationStatus;

  @Column('json', { nullable: true, name: 'receiver' })
  public _receiverJson!: string;
  private _receiver!: NominationReceiver;
  get receiver(): NominationReceiver {
    if (!this._receiver && this._receiverJson) {
      this._receiver = JSON.parse(this._receiverJson);
    }
    return this._receiver;
  }
  set receiver(value: NominationReceiver) {
    this._receiver = value;
    this._receiverJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    receiver: NominationReceiver,
    status: NominationStatus = NominationStatus.Pending,
  ): Nomination {
    const nomination = new Nomination();

    nomination._votingRound = votingRound;
    nomination._status = status;
    nomination.receiver = receiver; // Not `_receiver` because we want to use the setter.

    return nomination;
  }
}
