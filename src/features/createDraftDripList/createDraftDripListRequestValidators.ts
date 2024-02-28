import { body } from 'express-validator';

export const createDraftDripListRequestValidators = [
  body('name').isString().isLength({ min: 1, max: 50 }).escape(),
  body('description').isString().isLength({ min: 1, max: 200 }).escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  body('publisherAddressId').isString().isLength({ min: 1, max: 78 }).escape(),
];
