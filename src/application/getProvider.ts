import { FetchRequest } from 'ethers';
import appSettings from '../appSettings';
import { FailoverJsonRpcProvider } from '../infrastructure/FailoverProvider';

let providerInstance: FailoverJsonRpcProvider;

export default function getProvider(): FailoverJsonRpcProvider {
  if (!providerInstance) {
    const {
      primaryRpcUrl,
      primaryRpcAccessToken,
      fallbackRpcUrl,
      fallbackRpcAccessToken,
    } = appSettings;
    if (
      !primaryRpcUrl?.startsWith('http') ||
      (fallbackRpcUrl && !fallbackRpcUrl?.startsWith('http'))
    ) {
      throw new Error('Unsupported RPC URL protocol.');
    }

    const primaryEndpoint = primaryRpcAccessToken
      ? createAuthFetchRequest(primaryRpcUrl, primaryRpcAccessToken)
      : primaryRpcUrl;

    const rpcEndpoints = [primaryEndpoint];

    if (fallbackRpcUrl) {
      const fallbackEndpoint = fallbackRpcAccessToken
        ? createAuthFetchRequest(fallbackRpcUrl, fallbackRpcAccessToken)
        : fallbackRpcUrl;
      rpcEndpoints.push(fallbackEndpoint);
    }

    providerInstance = new FailoverJsonRpcProvider(rpcEndpoints);
  }

  return providerInstance;
}

function createAuthFetchRequest(rpcUrl: string, token: string): FetchRequest {
  const fetchRequest = new FetchRequest(rpcUrl);
  fetchRequest.method = 'POST';
  fetchRequest.setHeader('Content-Type', 'application/json');
  fetchRequest.setHeader('Authorization', `Bearer ${token}`);
  return fetchRequest;
}
