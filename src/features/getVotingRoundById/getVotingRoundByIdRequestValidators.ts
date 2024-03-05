import { param } from 'express-validator';

export const getVotingRoundByIdRequestValidators = [
  param('id').isUUID().escape(),
];
