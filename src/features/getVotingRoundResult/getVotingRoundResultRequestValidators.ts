import { param } from 'express-validator';

export const getVotingRoundResultRequestValidators = [
  param('votingRoundId').isUUID().escape(),
];
