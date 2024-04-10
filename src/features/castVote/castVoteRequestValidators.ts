import { body, param } from 'express-validator';

export const castVoteRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('date').isISO8601(),
  body('signature').isString().not().isEmpty().escape(),
  body('collaboratorAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  body('receivers').isArray().not().isEmpty().isLength({ max: 200 }),
  body('receivers.*.type').isIn(['address', 'project', 'dripList']).escape(),
  body('receivers.*.weight').custom(
    (value) => typeof value === 'number' && Number.isInteger(value),
  ),
];
