import { hexlify, toUtf8Bytes } from 'ethers';
import type IReceiverMapper from './interfaces/IReceiverMapper';
import { parseGitHubUrl } from './utils';
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
import type {
  AddressNominationReceiver,
  DripListNominationReceiver,
  NominationReceiver,
  ProjectNominationReceiver,
} from '../domain/votingRoundAggregate/Nomination';
import type Nomination from '../domain/votingRoundAggregate/Nomination';
import type {
  AddressNominationInfoDto,
  AllowedReceiverDto,
  DripListNominationInfoDto,
  NominationDto,
  NominationInfoDto,
  ProjectNominationInfoDto,
  ReceiverDto,
} from './dtos';
import type { AllowedReceiverData } from '../domain/allowedReceiver/AllowedReceiver';
import type {
  AddressDriverRead,
  OxString,
  RepoDriverRead,
} from './contractClients/contractClients';

export default class ReceiverMapper implements IReceiverMapper {
  private readonly _repoDriver: RepoDriverRead;
  private readonly _addressDriver: AddressDriverRead;

  public constructor(
    repoDriver: RepoDriverRead,
    addressDriver: AddressDriverRead,
  ) {
    this._repoDriver = repoDriver;
    this._addressDriver = addressDriver;
  }

  public async mapToAllowedReceiver(
    receiverDto: AllowedReceiverDto,
  ): Promise<AllowedReceiverData> {
    if ('address' in receiverDto) {
      const accountId = this._addressDriver({
        functionName: 'calcAccountId',
        args: [receiverDto.address as OxString],
      }).toString() as AddressDriverId;

      return {
        ...receiverDto,
        accountId,
      };
    }
    if ('url' in receiverDto) {
      const { username, repoName } = parseGitHubUrl(receiverDto.url);
      const projectName = `${username}/${repoName}`;
      const accountId = (
        await this._repoDriver({
          functionName: 'calcAccountId',
          args: [0, hexlify(toUtf8Bytes(`${projectName}`)) as OxString],
        })
      ).toString() as ProjectId;

      return {
        ...receiverDto,
        accountId,
      };
    }

    assertIsAccountId(receiverDto.accountId);
    return {
      accountId: receiverDto.accountId,
      type: 'dripList',
    };
  }

  public async mapToReceiver(receiverDto: ReceiverDto): Promise<Receiver> {
    if ('address' in receiverDto) {
      const accountId = this._addressDriver({
        functionName: 'calcAccountId',
        args: [receiverDto.address as OxString],
      }).toString() as AddressDriverId;

      return {
        ...receiverDto,
        accountId,
      } satisfies AddressReceiver;
    }
    if ('url' in receiverDto) {
      const { username, repoName } = parseGitHubUrl(receiverDto.url);
      const projectName = `${username}/${repoName}`;

      const accountId = (
        await this._repoDriver({
          functionName: 'calcAccountId',
          args: [0, hexlify(toUtf8Bytes(`${projectName}`)) as OxString],
        })
      ).toString() as ProjectId;

      return {
        ...receiverDto,
        accountId,
      } satisfies ProjectReceiver;
    }

    assertIsAccountId(receiverDto.accountId);
    return { ...receiverDto } as DripListReceiver;
  }

  public async mapToNominationReceiver(
    receiverDto: NominationDto,
  ): Promise<NominationReceiver> {
    if ('address' in receiverDto) {
      const accountId = this._addressDriver({
        functionName: 'calcAccountId',
        args: [receiverDto.address as OxString],
      }).toString() as AddressDriverId;

      return {
        ...receiverDto,
        accountId,
      } satisfies AddressNominationReceiver;
    }
    if ('url' in receiverDto) {
      const { username, repoName } = parseGitHubUrl(receiverDto.url);
      const projectName = `${username}/${repoName}`;

      const accountId = (
        await this._repoDriver({
          functionName: 'calcAccountId',
          args: [0, hexlify(toUtf8Bytes(`${projectName}`)) as OxString],
        })
      ).toString() as ProjectId;

      return {
        ...receiverDto,
        accountId,
      } satisfies ProjectNominationReceiver;
    }

    assertIsAccountId(receiverDto.accountId);
    return { ...receiverDto } as DripListNominationReceiver;
  }

  public mapToNominationInfoDto(nomination: Nomination): NominationInfoDto {
    const { receiver } = nomination;

    const commonInfo = {
      status: nomination._status,
      nominatedAt: nomination._createdAt,
      statusChangedAt: nomination._statusChangedAt,
      nominatedBy: nomination._nominatedBy,
      description: nomination._description,
      impactMetrics: nomination.impactMetrics,
    };

    if ('address' in receiver) {
      const { ...addressNominationDto } = receiver;
      return {
        ...addressNominationDto,
        ...commonInfo,
      } as AddressNominationInfoDto;
    }
    if ('url' in receiver) {
      const { ...projectNominationDto } = receiver;
      return {
        ...projectNominationDto,
        ...commonInfo,
      } as ProjectNominationInfoDto;
    }

    return {
      ...receiver,
      ...commonInfo,
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
