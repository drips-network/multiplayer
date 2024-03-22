import { body, param, query } from 'express-validator';

export const getVotingRoundResultRequestValidators = [
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  param('votingRoundId').isUUID().escape(),
  query('signature').optional().isString().escape(),
  query('date').optional().isISO8601().escape(),
];
