import { JsonRpcProvider } from 'ethers';
import appSettings from '../appSettings';

const provider = new JsonRpcProvider(appSettings.rpcUrl);

export default provider;
