import { param } from 'express-validator';

export const deleteDraftDripListRequestValidators = [
  param('id').isUUID().escape(),
];
