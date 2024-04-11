import { body, param } from 'express-validator';

export const setNominationsStatusesRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('date').isISO8601(),
  body('signature').isString().not().isEmpty().escape(),
  body('nominations').isArray().not().isEmpty().isLength({ max: 200 }),
  body('nominations.*.status')
    .isIn(['pending', 'accepted', 'rejected'])
    .escape(),
  body('nominations.*.accountId').isString().isLength({ min: 36 }).escape(),
];
