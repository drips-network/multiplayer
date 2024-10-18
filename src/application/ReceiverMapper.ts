import { Contract, hexlify, toUtf8Bytes } from 'ethers';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
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
import { getNetwork, type ChainId } from './network';
import getProvider from './getProvider';

export default class ReceiverMapper implements IReceiverMapper {
  private readonly _repoDriver: Contract;
  private readonly _addressDriver: Contract;

  public constructor(repoDriver: Contract, addressDriver: Contract) {
    this._repoDriver = repoDriver;
    this._addressDriver = addressDriver;
  }

  public async mapToAllowedReceiver(
    receiverDto: AllowedReceiverDto,
  ): Promise<AllowedReceiverData> {
    if ('address' in receiverDto) {
      return {
        ...receiverDto,
        accountId: (
          await this._addressDriver.calcAccountId(receiverDto.address)
        ).toString() as AddressDriverId,
      };
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

export class ReceiverMapperFactory {
  public static create(chainId: ChainId): ReceiverMapper {
    if (!chainId) {
      throw new Error('Chain ID is not provided.');
    }

    const {
      name: networkName,
      contracts: { addressDriverAddress, repoDriverAddress },
    } = getNetwork(chainId);

    const repoDriverAbi = this._loadAbi('RepoDriver', networkName);
    const addressDriverAbi = this._loadAbi('AddressDriver', networkName);

    const repoDriverContract = new Contract(
      repoDriverAddress,
      repoDriverAbi,
      getProvider(chainId),
    );

    const addressDriverContract = new Contract(
      addressDriverAddress,
      addressDriverAbi,
      getProvider(chainId),
    );

    return new ReceiverMapper(repoDriverContract, addressDriverContract);
  }

  private static _loadAbi(contractName: string, networkName: string) {
    const abiPath = path.join(
      __dirname,
      '..',
      'abi',
      networkName,
      `${contractName}.json`,
    );

    if (!existsSync(abiPath)) {
      throw new Error(
        `${contractName} ABI was not found for '${networkName}'.`,
      );
    }

    return JSON.parse(readFileSync(abiPath, 'utf-8'));
  }
}
