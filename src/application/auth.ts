import { verifyMessage as ethersVerifyMessage } from 'ethers';
import type { UUID } from 'crypto';
import type { Address } from '../domain/typeUtils';
import { UnauthorizedError } from './errors';

export function verifyMessage(
  message: string,
  signature: string,
  signerAddress: Address,
  currentTime: Date,
): void {
  const originalSigner = ethersVerifyMessage(message, signature);

  if (originalSigner.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new UnauthorizedError('Signature is not valid.');
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (currentTime < oneDayAgo || currentTime > now) {
    throw new UnauthorizedError('Vote is outdated.');
  }
}

export const REVEAL_VOTES_MESSAGE = (votingRoundId: UUID, currentTime: Date) =>
  `Reveal the votes for voting round with ID ${votingRoundId}. The current time is ${currentTime}.`;

export const REVEAL_RESULT_MESSAGE = (votingRoundId: UUID, currentTime: Date) =>
  `Reveal the result for voting round with ID ${votingRoundId}. The current time is ${currentTime}.`;

export const VOTE_MESSAGE_TEMPLATE = (
  currentTime: Date,
  voterAddress: string,
  votingRoundId: string,
  receivers: string[],
) => {
  const sortedReceivers = receivers.sort((a, b) => Number(a) - Number(b));

  return `Submit the vote for address ${voterAddress}, for the voting round with ID ${votingRoundId}. The current time is ${currentTime.toISOString()}. The receivers for this vote are: ${JSON.stringify(sortedReceivers)}`;
};

export const DELETE_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  votingRoundId: string,
) =>
  `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}.`;

export const START_VOTING_ROUND_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  dripListId: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort(
    (a, b) => Number(a) - Number(b),
  );

  return `Create a new voting round for the Drip List with ID ${dripListId}, owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this round are: ${JSON.stringify(sortedCollaborators)}`;
};

export const CREATE_COLLABORATIVE_LIST_MESSAGE_TEMPLATE = (
  currentTime: Date,
  publisherAddress: string,
  collaborators: string[],
) => {
  const sortedCollaborators = collaborators.sort(
    (a, b) => Number(a) - Number(b),
  );

  return `Create a new collaborative Drip List owned by ${publisherAddress}. The current time is ${currentTime.toISOString()}. The voters for this list are: ${JSON.stringify(sortedCollaborators)}`;
};
