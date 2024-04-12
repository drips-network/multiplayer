import { param, query } from 'express-validator';

export const getVotesRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  query('signature').optional().isString().escape(),
  query('date').optional().isISO8601().toDate(),
];
