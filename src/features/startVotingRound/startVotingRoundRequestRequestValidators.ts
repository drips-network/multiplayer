import { body, param } from 'express-validator';

export const startVotingRoundRequestRequestValidators = [
  body('startsAt').isISO8601().escape(),
  body('endsAt').isISO8601().escape(),
  param('id').isUUID().escape(),
];
