import { body } from 'express-validator';

export const createDraftDripListRequestValidators = [
  body('name').isString().isEmpty().isLength({ max: 50 }).escape(),
  body('description').isString().isEmpty().isLength({ max: 200 }).escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  body('publisherAddressId')
    .isString()
    .isEmpty()
    .isLength({ max: 78 })
    .escape(),
];
