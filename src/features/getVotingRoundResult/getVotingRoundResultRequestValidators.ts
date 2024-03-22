import { param, query } from 'express-validator';

export const getVotingRoundResultRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  query('signature').optional().isString().escape(),
  query('date').optional().isISO8601().escape(),
];
