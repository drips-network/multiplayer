import { param } from 'express-validator';

export const publishRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  param('publisherAddress')
    .if((p) => Boolean(p))
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  param('dripListId')
    .if((d) => Boolean(d))
    .isString()
    .isLength({ min: 36 })
    .escape(),
];
