import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { InvalidArgumentError } from '../errors';
import BaseEntity from '../BaseEntity';
import type VotingRound from '../votingRoundAggregate/VotingRound';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from '../votingRoundAggregate/Vote';

export type AllowedReceiverData =
  | Omit<AddressReceiver, 'weight'>
  | Omit<ProjectReceiver, 'weight'>
  | Omit<DripListReceiver, 'weight'>;

@Entity({
  name: 'AllowedReceivers',
})
export default class AllowedReceiver extends BaseEntity {
  @ManyToOne('VotingRound', (votingRound: VotingRound) => votingRound._votes, {
    nullable: false,
  })
  @JoinColumn({
    name: 'votingRoundId',
  })
  public _votingRound!: VotingRound;

  @Column('json', { nullable: false, name: 'receivers' })
  public _receiverDataJson!: string;
  private _receiverData!: AllowedReceiverData;
  get receiverData(): AllowedReceiverData {
    if (!this._receiverData && this._receiverDataJson) {
      this._receiverData = JSON.parse(this._receiverDataJson);
    }
    return this._receiverData;
  }
  set receiverData(value: AllowedReceiverData) {
    this._receiverData = value;
    this._receiverDataJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    receiverData: AllowedReceiverData,
  ): AllowedReceiver {
    if (!votingRound) {
      throw new InvalidArgumentError('Invalid votingRound.');
    }

    if (!receiverData) {
      throw new InvalidArgumentError('Invalid receiver data.');
    }

    const allowedReceiver = new AllowedReceiver();

    allowedReceiver._votingRound = votingRound;
    allowedReceiver.receiverData = receiverData; // Not `_receivers` because we want to use the setter.

    return allowedReceiver;
  }
}
