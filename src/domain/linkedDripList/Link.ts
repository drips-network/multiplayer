import { Column, Entity, OneToOne } from 'typeorm';
import type IAggregateRoot from '../IAggregateRoot';
import type { Address, DripListId } from '../typeUtils';
import DataSchemaConstants from '../../infrastructure/DataSchemaConstants';
import BaseEntity from '../BaseEntity';
import type VotingRound from '../votingRoundAggregate/VotingRound';
import { InvalidLinkOperationError } from '../errors';

export enum LinkStatus {
  Completed = 'Completed',
  AwaitingSafeTxExecution = 'AwaitingSafeTxExecution',
}

export type SafeTx = {
  safeAddress: Address;
  transactionHash: string;
  isExecuted: boolean;
  isSuccessful: boolean | undefined;
};

@Entity({
  name: 'Links',
})
export default class Link extends BaseEntity implements IAggregateRoot {
  @Column('varchar', {
    nullable: false,
    length: DataSchemaConstants.ACCOUNT_ID_MAX_LENGTH,
    name: 'dripListId',
  })
  public _dripListId!: DripListId;

  @OneToOne('VotingRound', (votingRound: VotingRound) => votingRound._link, {
    nullable: false,
  })
  public _votingRound!: VotingRound;

  @Column('varchar', {
    nullable: true,
    length: DataSchemaConstants.TRANSACTION_HASH_LENGTH,
    name: 'safeTransactionHash',
  })
  public _safeTransactionHash: string | undefined;

  @Column('bool', {
    nullable: true,
    name: 'isSafeTransactionExecuted',
  })
  public _isSafeTransactionExecuted: boolean | undefined;

  public get status(): LinkStatus {
    const isSafe = Boolean(this._safeTransactionHash);
    const isSafeTransactionExecuted = Boolean(this._isSafeTransactionExecuted);

    if (!isSafe || isSafeTransactionExecuted) {
      return LinkStatus.Completed;
    }

    return LinkStatus.AwaitingSafeTxExecution;
  }

  public get linkedAt(): Date | undefined {
    if (this.status === LinkStatus.Completed) {
      return this._updatedAt;
    }

    return undefined;
  }

  public static create(
    dripListId: DripListId,
    votingRound: VotingRound,
    safeTx: SafeTx | undefined = undefined,
  ): Link {
    const link = new Link();

    link._dripListId = dripListId;
    link._votingRound = votingRound;

    if (safeTx) {
      const { safeAddress, transactionHash, isExecuted, isSuccessful } = safeTx;

      if (safeAddress !== votingRound.publisherAddress) {
        throw new InvalidLinkOperationError(
          'Cannot create a link with a safe transaction that does not belong to the voting round publisher.',
        );
      }

      if (!transactionHash) {
        throw new InvalidLinkOperationError(
          'Cannot create a link with a safe transaction that does not have a transaction hash.',
        );
      }

      if (isExecuted && isSuccessful === false) {
        throw new InvalidLinkOperationError(
          'Cannot create a link with a safe transaction that was not executed successfully.',
        );
      }

      link._safeTransactionHash = transactionHash;
      link._isSafeTransactionExecuted = isExecuted && isSuccessful;
    }

    return link;
  }

  public markSafeTransactionAsExecuted(): void {
    if (this.status === LinkStatus.AwaitingSafeTxExecution) {
      this._isSafeTransactionExecuted = true;
    }
  }
}
