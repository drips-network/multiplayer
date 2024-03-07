import { body } from 'express-validator';

export const startVotingRoundRequestRequestValidators = [
  body('startsAt').isISO8601().escape(),
  body('endsAt').isISO8601().escape(),
  body('dripListId').isUUID().escape(),
  body('name').isString().isLength({ max: 50 }).escape(),
  body('description').isString().isLength({ max: 200 }).escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  body('publisherAddressDriverId')
    .isString()
    .not()
    .isEmpty()
    .isLength({ max: 78 })
    .escape(),
];
