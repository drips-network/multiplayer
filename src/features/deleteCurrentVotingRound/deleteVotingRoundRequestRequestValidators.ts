import { body, param } from 'express-validator';

export const deleteVotingRoundRequestRequestValidators = [
  body('startsAt').isISO8601().escape(),
  body('endsAt').isISO8601().escape(),
  param('draftDripListId').isUUID().escape(),
];
