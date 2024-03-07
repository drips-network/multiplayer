import { param } from 'express-validator';

export const softDeleteVotingRoundRequestValidators = [
  param('id').isUUID().escape(),
];
