import { body, param } from 'express-validator';

export const linkRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('dripListId').isString().isLength({ min: 36 }).escape(),
];
