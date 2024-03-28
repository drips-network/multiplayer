import { body, param } from 'express-validator';

export const nominateRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('nomination.type').isIn(['address', 'project', 'dripList']).escape(),
  body('nomination.accountId').isString().isLength({ min: 36 }).escape(),
];
