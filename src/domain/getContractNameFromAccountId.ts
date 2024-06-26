export default function getContractNameFromAccountId(
  id: string,
):
  | 'drips'
  | 'nftDriver'
  | 'repoDriver'
  | 'addressDriver'
  | 'immutableSplitsDriver' {
  if (Number.isNaN(Number(id))) {
    throw new Error(
      `Could not infer contract name from account ID '${id}'. The provided ID is not a number.`,
    );
  }

  const accountIdAsBigInt = BigInt(id);

  if (accountIdAsBigInt < 0n || accountIdAsBigInt > 2n ** 256n - 1n) {
    throw new Error(
      `Could not infer contract name from account ID '${id}'. The provided ID is not a valid positive number within the range of a uint256.`,
    );
  }

  const mask = 2n ** 32n - 1n; // 32 bits mask

  const bits = (accountIdAsBigInt >> 224n) & mask; // eslint-disable-line no-bitwise

  switch (bits) {
    case 0n:
      return 'addressDriver';
    case 1n:
      return 'nftDriver';
    case 2n:
      return 'immutableSplitsDriver';
    case 3n:
      return 'repoDriver';
    default:
      throw new Error(`Unknown driver for ID ${id}.`);
  }
}
