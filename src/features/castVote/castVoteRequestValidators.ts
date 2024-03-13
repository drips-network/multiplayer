import { body, param } from 'express-validator';

export const castVoteRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('date').isISO8601().escape(),
  body('signature').isString().not().isEmpty().escape(),
  body('collaboratorAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  body('receivers').isArray().not().isEmpty().isLength({ max: 200 }),
  body('receivers.*.type').isIn(['address', 'project', 'dripList']).escape(),
  body('receivers.*.accountId')
    .isString()
    .not()
    .isEmpty()
    .isLength({ max: 78 })
    .escape(),
  body('receivers.*.weight').isNumeric(),
];
