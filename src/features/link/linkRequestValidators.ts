import { body, param } from 'express-validator';

export const linkRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('dripListId')
    .if((_, { req }) => req.body.dripListId)
    .isString()
    .isLength({ min: 36 })
    .escape(),
  body('safeTransactionHash')
    .if((_, { req }) => req.body.dripListId)
    .isString()
    .isLength({ min: 66, max: 66 })
    .escape(),
];
