import { body, param } from 'express-validator';

export const linkRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
];
