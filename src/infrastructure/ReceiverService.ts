import { hexlify, toUtf8Bytes } from 'ethers';
import type { ReceiverDto } from '../application/dtos/ReceiverDto';
import type IReceiverService from '../application/interfaces/IReceiverService';
import { parseGitHubUrl } from '../application/utils';
import {
  assertIsAccountId,
  type AddressDriverId,
  type ProjectId,
} from '../domain/typeUtils';
import type {
  AddressReceiver,
  DripListReceiver,
  ProjectReceiver,
  Receiver,
} from '../domain/votingRoundAggregate/Vote';
import type { AddressDriver, RepoDriver } from '../generated/contracts';
import type {
  AddressNominationReceiver,
  DripListNominationReceiver,
  NominationReceiver,
  ProjectNominationReceiver,
} from '../domain/votingRoundAggregate/Nomination';
import type { NominationDto } from '../features/nominate/NominateRequest';

export default class ReceiverService implements IReceiverService {
  private readonly _repoDriver: RepoDriver;
  private readonly _addressDriver: AddressDriver;

  public constructor(repoDriver: RepoDriver, addressDriver: AddressDriver) {
    this._repoDriver = repoDriver;
    this._addressDriver = addressDriver;
  }

  public async mapToReceiver(receiverDto: ReceiverDto): Promise<Receiver> {
    if ('address' in receiverDto) {
      return {
        ...receiverDto,
        accountId: (
          await this._addressDriver.calcAccountId(receiverDto.address)
        ).toString() as AddressDriverId,
      } satisfies AddressReceiver;
    }
    if ('url' in receiverDto) {
      const { username, repoName } = parseGitHubUrl(receiverDto.url);
      const projectName = `${username}/${repoName}`;
      return {
        ...receiverDto,
        accountId: (
          await this._repoDriver.calcAccountId(
            0,
            hexlify(toUtf8Bytes(`${projectName}`)),
          )
        ).toString() as ProjectId,
      } satisfies ProjectReceiver;
    }

    assertIsAccountId(receiverDto.accountId);
    return { ...receiverDto } as DripListReceiver;
  }

  async mapToNominationReceiver(
    receiverDto: NominationDto,
  ): Promise<NominationReceiver> {
    if ('address' in receiverDto) {
      return {
        ...receiverDto,
        accountId: (
          await this._addressDriver.calcAccountId(receiverDto.address)
        ).toString() as AddressDriverId,
      } satisfies AddressNominationReceiver;
    }
    if ('url' in receiverDto) {
      const { username, repoName } = parseGitHubUrl(receiverDto.url);
      const projectName = `${username}/${repoName}`;
      return {
        ...receiverDto,
        accountId: (
          await this._repoDriver.calcAccountId(
            0,
            hexlify(toUtf8Bytes(`${projectName}`)),
          )
        ).toString() as ProjectId,
      } satisfies ProjectNominationReceiver;
    }

    assertIsAccountId(receiverDto.accountId);
    return { ...receiverDto } as DripListNominationReceiver;
  }
}
