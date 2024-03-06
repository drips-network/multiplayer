import { body, param } from 'express-validator';

export const setCollaboratorsRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('collaborators').isArray().isLength({ min: 1, max: 50 }),
  body('collaborators.*.address').isString().isLength({ max: 42 }).escape(),
  body('collaborators.*.publisherAddress')
    .isString()
    .isLength({ max: 42 })
    .escape(),
  body('collaborators.*.addressDriverId')
    .isString()
    .isLength({ max: 78 })
    .escape(),
];
