import { param } from 'express-validator';

export const getDraftDripListByIdRequestValidators = [
  param('draftDripListId').isUUID().escape(),
];
