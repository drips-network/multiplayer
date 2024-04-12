import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseEntity from '../BaseEntity';
import type VotingRound from './VotingRound';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
} from './Vote';
import type { Address } from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';

export type ImpactMetric = {
  key: string;
  value: number;
  link: string;
};

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

  @Column('timestamp', {
    nullable: false,
    name: 'statusChangedAt',
  })
  public _statusChangedAt!: Date;

  @Column('varchar', {
    nullable: false,
    name: 'address',
    length: DataSchemaConstants.ADDRESS_LENGTH,
  })
  public _nominatedBy!: Address;

  @Column('varchar', { nullable: false, length: 200, name: 'description' })
  public _description!: string;

  @Column('json', { nullable: false, name: 'impactMetrics' })
  public _impactMetricsJson!: string;
  private _impactMetrics!: ImpactMetric[];
  get impactMetrics(): ImpactMetric[] {
    if (!this._impactMetrics && this._impactMetricsJson) {
      this._impactMetrics = JSON.parse(this._impactMetricsJson);
    }
    return this._impactMetrics;
  }
  set impactMetrics(value: ImpactMetric[]) {
    this._impactMetrics = value;
    this._impactMetricsJson = JSON.stringify(value);
  }

  public static create(
    votingRound: VotingRound,
    receiver: NominationReceiver,
    nominatedBy: Address,
    description: string,
    impactMetrics: ImpactMetric[],
  ): Nomination {
    if (!votingRound) {
      throw new Error('Invalid votingRound.');
    }

    if (!receiver) {
      throw new Error('Invalid receiver.');
    }

    if (!nominatedBy) {
      throw new Error('Invalid nominatedBy.');
    }

    if (!description) {
      throw new Error('Invalid description.');
    }

    if (!impactMetrics || !impactMetrics.length) {
      throw new Error('Invalid impactMetrics.');
    }

    const nomination = new Nomination();

    nomination._status = NominationStatus.Pending;
    nomination.receiver = receiver; // NOT `nomination._receiver` because we want to use the getter.
    nomination._votingRound = votingRound;
    nomination._nominatedBy = nominatedBy;
    nomination._description = description;
    nomination._statusChangedAt = new Date();
    nomination.impactMetrics = impactMetrics; // NOT `nomination._impactMetrics` because we want to use the setter.

    return nomination;
  }
}
