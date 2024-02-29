import { param } from 'express-validator';

export const deleteCurrentVotingRoundRequestRequestValidators = [
  param('id').isUUID().escape(),
];
