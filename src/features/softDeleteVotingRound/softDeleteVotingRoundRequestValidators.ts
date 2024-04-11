import { body, param } from 'express-validator';

export const softDeleteVotingRoundRequestValidators = [
  param('id').isUUID().escape(),
  body('date').isISO8601(),
  body('signature').isString().not().isEmpty().escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
];
