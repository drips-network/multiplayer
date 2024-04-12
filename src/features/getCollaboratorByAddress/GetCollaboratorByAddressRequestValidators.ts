import { param, query } from 'express-validator';

export const getCollaboratorByAddressRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  param('collaboratorAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  query('signature').optional().isString().escape(),
  query('date').optional().isISO8601().escape(),
];
