import { FetchRequest, JsonRpcProvider } from 'ethers';
import appSettings from '../appSettings';

const provider = appSettings.rpcUrlAccessToken
  ? new JsonRpcProvider(
      createAuthFetchRequest(appSettings.rpcUrl, appSettings.rpcUrlAccessToken),
    )
  : new JsonRpcProvider(appSettings.rpcUrl);

function createAuthFetchRequest(rpcUrl: string, token: string): FetchRequest {
  const fetchRequest = new FetchRequest(rpcUrl);
  fetchRequest.method = 'POST';
  fetchRequest.setHeader('Content-Type', 'application/json');
  fetchRequest.setHeader('Authorization', `Bearer ${token}`);
  return fetchRequest;
}

export default provider;
