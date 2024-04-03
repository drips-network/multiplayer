import { hexlify, toUtf8Bytes } from 'ethers';
import type IReceiverMapper from '../application/interfaces/IReceiverMapper';
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
import type {
  AddressNominationInfoDto,
  DripListNominationInfoDto,
  NominationInfoDto,
  ProjectNominationInfoDto,
} from '../features/getVotingRoundById/GetVotingRoundByIdResponse';
import type Nomination from '../domain/votingRoundAggregate/Nomination';
import type { ReceiverDto } from '../application/dtos';

export default class ReceiverMapper implements IReceiverMapper {
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

  public async mapToNominationReceiver(
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

  public mapToNominationInfoDto(nomination: Nomination): NominationInfoDto {
    const { receiver } = nomination;

    if ('address' in receiver) {
      const { ...addressNominationDto } = receiver;
      return {
        ...addressNominationDto,
        status: nomination._status,
        nominatedAt: nomination._createdAt,
      } as AddressNominationInfoDto;
    }
    if ('url' in receiver) {
      const { ...projectNominationDto } = receiver;
      return {
        ...projectNominationDto,
        status: nomination._status,
        nominatedAt: nomination._createdAt,
      } as ProjectNominationInfoDto;
    }

    return {
      ...receiver,
      status: nomination._status,
      nominatedAt: nomination._createdAt,
    } as DripListNominationInfoDto;
  }

  public mapToReceiverDto(receiver: Receiver): ReceiverDto {
    if ('address' in receiver) {
      return {
        address: receiver.address,
        weight: receiver.weight,
        type: receiver.type,
      };
    }
    if ('url' in receiver) {
      return {
        url: receiver.url,
        weight: receiver.weight,
        type: receiver.type,
      };
    }

    return {
      accountId: receiver.accountId,
      weight: receiver.weight,
      type: receiver.type,
    };
  }
}
