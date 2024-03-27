import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from '../BaseEntity';
import type VotingRound from './VotingRound';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type { AccountId } from '../typeUtils';
import type { Receiver } from './Vote';

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

  @Column('varchar', {
    nullable: false,
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    name: 'accountId',
  })
  public _accountId!: AccountId;

  @Column('enum', {
    nullable: false,
    name: 'status',
    enum: NominationStatus,
  })
  public _status!: NominationStatus;

  @Column('json', { nullable: true, name: 'receiver' })
  public _receiverJson!: string;
  private _receiver!: Receiver;
  get receiver(): Receiver {
    if (!this._receiver && this._receiverJson) {
      this._receiver = JSON.parse(this._receiverJson);
    }
    return this._receiver;
  }
  set receiver(value: Receiver) {
    this._receiver = value;
    this._receiverJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    receiver: Receiver,
    status: NominationStatus = NominationStatus.Pending,
  ): Nomination {
    const nomination = new Nomination();

    nomination._votingRound = votingRound;
    nomination._status = status;
    nomination.receiver = receiver; // Not `_receiver` because we want to use the setter.

    return nomination;
  }
}
