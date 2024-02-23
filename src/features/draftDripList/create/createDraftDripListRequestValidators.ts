import { body } from 'express-validator';

export const createDraftDripListRequestRequestValidators = [
  body('name').isString().isLength({ min: 1, max: 50 }).escape(),
  body('description').isString().isLength({ min: 1, max: 200 }).escape(),
];
