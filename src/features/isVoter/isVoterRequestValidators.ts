import { param } from 'express-validator';

export const isVoterRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  param('collaboratorAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
];
