import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype';
import { Contract } from 'ethers';
import type { AddressDriverAbi } from './AddressDriverAbi';
import { addressDriverAbi } from './AddressDriverAbi';
import provider from '../provider';
import { getNetworkConfig } from '../networkConfig';
import type { RepoDriverAbi } from './RepoDriverAbi';
import { repoDriverAbi } from './RepoDriverAbi';

export type OxString = `0x${string}`;

export type UnwrappedEthersResult<T> = T extends [infer U]
  ? U
  : T extends readonly [infer U]
    ? U
    : T;

export default function unwrapEthersResult<T>(
  result: T | T[],
): UnwrappedEthersResult<T> | UnwrappedEthersResult<T[]> {
  if (Array.isArray(result) && result.length === 1) {
    return result[0] as UnwrappedEthersResult<T>;
  }

  return result as UnwrappedEthersResult<T[]>;
}

export type AddressDriverRead = typeof executeAddressDriverReadMethod;

export async function executeAddressDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<
    AddressDriverAbi,
    'pure' | 'view'
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    AddressDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<AddressDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<
    AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>
  >
> {
  const { functionName: func, args } = config;

  const addressDriverAddress = getNetworkConfig().ADDRESS_DRIVER;
  const addressDriver = new Contract(
    addressDriverAddress,
    addressDriverAbi,
    provider,
  );

  return unwrapEthersResult(await addressDriver[func](...(args as any)));
}

export type RepoDriverRead = typeof executeRepoDriverReadMethod;

export async function executeRepoDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    RepoDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<RepoDriverAbi, 'pure' | 'view'>;
  args: AbiParametersToPrimitiveTypes<abiFunction['inputs'], 'inputs'>;
}): Promise<
  UnwrappedEthersResult<
    AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>
  >
> {
  const { functionName: func, args } = config;

  const repoDriverAddress = getNetworkConfig().REPO_DRIVER;
  const repoDriver = new Contract(repoDriverAddress, repoDriverAbi, provider);

  return unwrapEthersResult(await repoDriver[func](...(args as any)));
}
