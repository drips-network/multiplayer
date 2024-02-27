import { param } from 'express-validator';

export const getDraftDripListByIdRequestValidators = [
  param('id').isUUID().escape(),
];
