import { param } from 'express-validator';

export const getVotesRequestValidators = [
  param('votingRoundId').isUUID().escape(),
];
