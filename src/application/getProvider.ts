import { FetchRequest } from 'ethers';
import appSettings from '../appSettings';
import { FailoverJsonRpcProvider } from '../infrastructure/FailoverProvider';
import { getNetwork, type ChainId } from './network';

const { rpcConfig } = appSettings;

const providers: { [chainId: string]: FailoverJsonRpcProvider } = {};

function createAuthFetchRequest(rpcUrl: string, token: string): FetchRequest {
  const fetchRequest = new FetchRequest(rpcUrl);
  fetchRequest.method = 'POST';
  fetchRequest.setHeader('Content-Type', 'application/json');
  fetchRequest.setHeader('Authorization', `Bearer ${token}`);
  return fetchRequest;
}

function initProvider(chainId: ChainId): FailoverJsonRpcProvider {
  const { name: networkName } = getNetwork(chainId);
  const config = rpcConfig[networkName];

  if (!config) {
    throw new Error(
      `RPC configuration not found for chain ${chainId} (${networkName}) in environment variables.`,
    );
  }

  const { url, accessToken, fallbackUrl, fallbackAccessToken } = config;

  if (
    !url.startsWith('http') ||
    (fallbackUrl && !fallbackUrl.startsWith('http'))
  ) {
    throw new Error('Unsupported RPC URL protocol.');
  }

  const primaryEndpoint = accessToken
    ? createAuthFetchRequest(url, accessToken)
    : url;

  const rpcEndpoints = [primaryEndpoint];

  if (fallbackUrl) {
    const fallbackEndpoint = fallbackAccessToken
      ? createAuthFetchRequest(fallbackUrl, fallbackAccessToken)
      : fallbackUrl;
    rpcEndpoints.push(fallbackEndpoint);
  }

  return new FailoverJsonRpcProvider(rpcEndpoints);
}

export default function getProvider(chainId: ChainId): FailoverJsonRpcProvider {
  if (!providers[chainId]) {
    providers[chainId] = initProvider(chainId);
  }

  return providers[chainId];
}
