import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import BaseEntity from '../BaseEntity';
import {
  InvalidArgumentError,
  InvalidVotingRoundOperationError,
} from '../errors';
import type IAggregateRoot from '../IAggregateRoot';
import type { Receiver } from './Vote';
import type { AccountId, Address, DripListId } from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import type Publisher from '../publisherAggregate/Publisher';
import type { SafeTx } from '../linkedDripList/Link';
import Link, { LinkStatus } from '../linkedDripList/Link';
import { TOTAL_VOTE_WEIGHT } from '../constants';
import Vote from './Vote';
import type Nomination from './Nomination';
import { NominationStatus } from './Nomination';
import { nowInMillis } from '../../application/utils';
import type AllowedReceiver from '../allowedReceiver/AllowedReceiver';

export enum VotingRoundStatus {
  Started = 'Started',
  Completed = 'Completed',
  Deleted = 'Deleted',
  Linked = 'Linked',
  PendingLinkCompletion = 'PendingLinkCompletion',
}

@Entity({
  name: 'VotingRounds',
})
export default class VotingRound extends BaseEntity implements IAggregateRoot {
  private static readonly TIME_BUFFER_MS = 1000; // 1 second buffer.

  @Column('timestamptz', { nullable: false, name: 'votingStartsAt' })
  public _votingStartsAt!: Date;

  @Column('timestamptz', { nullable: false, name: 'votingEndsAt' })
  public _votingEndsAt!: Date;

  @Column('timestamptz', { nullable: true, name: 'nominationStartsAt' })
  public _nominationStartsAt: Date | undefined;

  @Column('timestamptz', { nullable: true, name: 'nominationEndsAt' })
  public _nominationEndsAt: Date | undefined;

  @ManyToOne('Publisher', (publisher: Publisher) => publisher._votingRounds, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({
    name: 'publisherId',
  })
  public _publisher!: Publisher;

  @Column('varchar', {
    nullable: true,
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    name: 'dripListId',
  })
  public _dripListId: DripListId | undefined;

  @Column('varchar', { nullable: true, length: 80, name: 'name' })
  public _name: string | undefined;

  @Column('varchar', { nullable: true, length: 1000, name: 'description' })
  public _description: string | undefined;

  @Column('bool', { nullable: false, name: 'areVotesPrivate' })
  public _areVotesPrivate!: boolean;

  @Column('varchar', {
    array: true,
    nullable: false,
    name: 'collaborators',
    length: DataSchemaConstants.ADDRESS_LENGTH,
  })
  public _collaborators!: Address[];

  @OneToMany('Vote', (vote: Vote) => vote._votingRound, {
    nullable: true,
    cascade: true,
  })
  public _votes: Vote[] | undefined;

  @OneToMany(
    'Nominations',
    (nomination: Nomination) => nomination._votingRound,
    {
      nullable: true,
      cascade: true,
    },
  )
  public _nominations: Nomination[] | undefined;

  @OneToMany(
    'AllowedReceivers',
    (allowedReceiver: AllowedReceiver) => allowedReceiver._votingRound,
    {
      nullable: true,
      cascade: true,
    },
  )
  public _allowedReceivers: AllowedReceiver[] | undefined;

  @OneToOne('Link', (link: Link) => link._votingRound, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'linkId' })
  public _link: Link | undefined;

  public get publisherAddress() {
    return this._publisher._address;
  }

  public get status(): VotingRoundStatus {
    if (this._deletedAt) {
      return VotingRoundStatus.Deleted;
    }

    if (this._link?.status === LinkStatus.Completed) {
      return VotingRoundStatus.Linked;
    }

    if (this._link?.status === LinkStatus.AwaitingSafeTxExecution) {
      return VotingRoundStatus.PendingLinkCompletion;
    }

    if (this._votingEndsAt.getTime() < nowInMillis()) {
      return VotingRoundStatus.Completed;
    }

    return VotingRoundStatus.Started;
  }

  public get nominationPeriod() {
    return {
      isSet: Boolean(this._nominationStartsAt && this._nominationEndsAt),
      isOpen: Boolean(
        this._nominationStartsAt &&
          this._nominationEndsAt &&
          nowInMillis() <= this._nominationEndsAt.getTime(),
      ),
    };
  }

  public get votingPeriod() {
    return {
      hasStarted: nowInMillis() >= this._votingStartsAt.getTime(),
    };
  }

  public static create(
    startsAt: Date,
    endsAt: Date,
    publisher: Publisher,
    dripListId: DripListId | undefined,
    name: string | undefined,
    description: string | undefined,
    collaborators: Address[],
    areVotesPrivate: boolean,
    nominationStartsAt: Date | undefined,
    nominationEndsAt: Date | undefined,
  ): VotingRound {
    const startsAtTime = new Date(startsAt).getTime();
    const endsAtTime = new Date(endsAt).getTime();

    if (startsAtTime > endsAtTime) {
      throw new InvalidArgumentError('Start date must be before end date.');
    }

    if (startsAtTime < nowInMillis() - this.TIME_BUFFER_MS) {
      throw new InvalidArgumentError('Start date must be in the future.');
    }

    if (
      (nominationStartsAt && !nominationEndsAt) ||
      (!nominationStartsAt && nominationEndsAt)
    ) {
      throw new InvalidArgumentError(
        'Both nomination start and end dates must be provided.',
      );
    }

    if (
      nominationStartsAt &&
      new Date(nominationStartsAt).getTime() <
        nowInMillis() - this.TIME_BUFFER_MS
    ) {
      throw new InvalidArgumentError(
        'Nomination start date must be in the future.',
      );
    }

    if (
      nominationStartsAt &&
      nominationEndsAt &&
      nominationStartsAt.getTime() > nominationEndsAt.getTime()
    ) {
      throw new InvalidArgumentError(
        'Nomination start date must be before nomination end date.',
      );
    }

    if (nominationEndsAt && nominationEndsAt.getTime() > startsAtTime) {
      throw new InvalidArgumentError(
        'Nomination end date must be before the voting round start date.',
      );
    }

    if (name?.length && name.length > 80) {
      throw new InvalidArgumentError(
        'Name must be less than 80 characters long.',
      );
    }

    if (description?.length && description.length > 1000) {
      throw new InvalidArgumentError(
        'Description must be less than 1000 characters long.',
      );
    }

    if (description && !name) {
      throw new InvalidArgumentError('Name must be provided.');
    }

    if (name && description && dripListId) {
      throw new InvalidArgumentError(
        'You can provide either a Drip List id or a name and description, but not both.',
      );
    }

    const seen = new Set();
    for (const address of collaborators) {
      if (seen.has(address)) {
        throw new InvalidArgumentError(
          `Collaborators cannot contain duplicates.`,
        );
      }
      seen.add(address);
    }

    const votingRound = new VotingRound();

    votingRound._votingStartsAt = startsAt;
    votingRound._votingEndsAt = endsAt;
    votingRound._publisher = publisher;
    votingRound._dripListId = dripListId;
    votingRound._name = name;
    votingRound._description = description;
    votingRound._collaborators = collaborators;
    votingRound._areVotesPrivate = areVotesPrivate;
    votingRound._nominationStartsAt = nominationStartsAt;
    votingRound._nominationEndsAt = nominationEndsAt;

    return votingRound;
  }

  public castVote(collaborator: Address, receivers: Receiver[]): void {
    if (!this._collaborators?.find((c) => c === collaborator)) {
      throw new InvalidArgumentError(
        'Collaborator is not part of the voting round.',
      );
    }

    if (receivers.length > 200) {
      throw new InvalidArgumentError(
        'A maximum of 200 vote allocations can be added to a voting round.',
      );
    }

    if (
      receivers.reduce((sum, receiver) => sum + Number(receiver.weight), 0) !==
      TOTAL_VOTE_WEIGHT
    ) {
      throw new InvalidArgumentError(
        `The sum of the weights must be ${TOTAL_VOTE_WEIGHT} for each vote allocation.`,
      );
    }

    const vote = Vote.create(this, collaborator, receivers);

    if (!this._votes) {
      this._votes = [];
    }

    this._votes.push(vote);
  }

  public getLatestVotes(): {
    collaborator: Address;
    latestVote: Vote | null;
  }[] {
    const collaboratorVotes: {
      collaborator: Address;
      latestVote: Vote | null;
    }[] =
      this._collaborators?.map((collaborator) => ({
        collaborator,
        latestVote: null,
      })) || [];

    if (this._votes?.length) {
      this._votes.sort(
        (a, b) => b._updatedAt.getTime() - a._updatedAt.getTime(),
      );

      const latestVoteMap = new Map<Address, Vote>();

      this._votes.forEach((vote) => {
        const collaboratorAddressId = vote._collaborator;
        if (!latestVoteMap.has(collaboratorAddressId)) {
          latestVoteMap.set(collaboratorAddressId, vote);
        }
      });

      collaboratorVotes.forEach((cv) => {
        const latestVote = latestVoteMap.get(cv.collaborator);
        // eslint-disable-next-line no-param-reassign
        cv.latestVote = latestVote || null;
      });
    }

    return collaboratorVotes;
  }

  public getResult(): Receiver[] {
    const latestVotes = this.getLatestVotes() || [];
    const receiverDetails: Record<
      string,
      Receiver & { voteCount: number; totalWeight: number }
    > = {};

    // Accumulate total weights for each receiver.
    latestVotes.forEach((vote) =>
      vote.latestVote?.receivers?.forEach((receiver) => {
        const key = receiver.accountId;
        if (!receiverDetails[key]) {
          receiverDetails[key] = { ...receiver, voteCount: 0, totalWeight: 0 };
        }
        receiverDetails[key].voteCount += 1;
        receiverDetails[key].totalWeight += receiver.weight;
      }),
    );

    const totalInitialWeight = Object.values(receiverDetails).reduce(
      (sum, { totalWeight }) => sum + totalWeight,
      0,
    );

    // Calculate proportions and redistribute weights.
    let redistributedTotal = 0;
    const receivers = Object.values(receiverDetails).map((receiver) => {
      const proportion = receiver.totalWeight / totalInitialWeight;
      const redistributedWeight = Math.round(proportion * 1000000); // Round to nearest whole number.
      redistributedTotal += redistributedWeight;
      return { ...receiver, weight: redistributedWeight };
    });

    // Adjust for rounding to ensure total is exactly 1,000,000.
    // Find the difference caused by rounding and adjust the last receiver accordingly.
    const roundingDifference = 1000000 - redistributedTotal;
    if (receivers.length > 0 && roundingDifference !== 0) {
      receivers[receivers.length - 1].weight += roundingDifference;
    }

    return receivers.map(
      ({ voteCount: _voteCount, totalWeight: _totalWeight, ...receiver }) =>
        receiver,
    );
  }

  public nominate(nomination: Nomination): void {
    const { isSet, isOpen } = this.nominationPeriod;

    if (!isSet) {
      throw new InvalidVotingRoundOperationError(
        'This voting round does not accept nominations.',
      );
    }

    if (!isOpen) {
      throw new InvalidVotingRoundOperationError(
        'Nomination period is closed.',
      );
    }

    if (!this._nominations) {
      this._nominations = [];
    }

    if (
      this._nominations.some(
        (n) =>
          n.receiver.accountId === nomination.receiver.accountId &&
          n._status !== NominationStatus.Rejected,
      )
    ) {
      throw new InvalidArgumentError('Receiver has already been nominated.');
    }

    // If the receiver has been nominated before and was rejected, remove the rejected nomination to allow re-nomination.
    if (
      this._nominations.some(
        (n) =>
          n.receiver.accountId === nomination.receiver.accountId &&
          n._status === NominationStatus.Rejected,
      )
    ) {
      const index = this._nominations.findIndex(
        (n) => n.receiver.accountId === nomination.receiver.accountId,
      );

      this._nominations.splice(index, 1);
    }

    this._nominations.push(nomination);
  }

  public setNominationsStatuses(
    nominations: { accountId: AccountId; status: NominationStatus }[],
  ): void {
    if (!this._nominations || !this._nominations.length) {
      throw new InvalidArgumentError(
        'There are no nominations to accept for this voting round.',
      );
    }

    if (this.votingPeriod.hasStarted) {
      throw new InvalidVotingRoundOperationError(
        'Cannot accept nominations after the voting period has started.',
      );
    }

    nominations.forEach((nomination) => {
      const index = this._nominations!.findIndex(
        (n) => n.receiver.accountId === nomination.accountId,
      );

      if (index === -1) {
        throw new InvalidArgumentError(
          `Receiver with account ID ${nomination.accountId} has not been nominated for this voting round.`,
        );
      }

      this._nominations![index]._status = nomination.status;
      this._nominations![index]._statusChangedAt = new Date();
    });
  }

  public async linkToDripList(
    dripListId: DripListId,
    safeTx: SafeTx | undefined = undefined,
  ): Promise<void> {
    if (this._dripListId && this._dripListId !== dripListId) {
      throw new InvalidVotingRoundOperationError(
        'A Drip List ID is already set for this voting round and the provided Drip List ID does not match.',
      );
    }

    if (this.status !== VotingRoundStatus.Completed) {
      throw new InvalidVotingRoundOperationError(
        `Cannot link a voting round that is in '${this.status}' status.`,
      );
    }

    if (!this._votes?.length) {
      throw new InvalidVotingRoundOperationError(
        'Cannot link a Drip List to a voting round with no votes.',
      );
    }

    const link = Link.create(dripListId, this, safeTx);

    this._link = link;
    this._dripListId = dripListId;
  }
}
