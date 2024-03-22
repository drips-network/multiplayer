import { body, param, query } from 'express-validator';

export const getVotesRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  query('signature').optional().isString().escape(),
  query('date').optional().isISO8601().escape(),
  body('publisherAddress')
    .if((p) => Boolean(p))
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
];
