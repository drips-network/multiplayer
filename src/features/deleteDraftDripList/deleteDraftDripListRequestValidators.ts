import { param } from 'express-validator';

export const deleteDraftDripListRequestValidators = [
  param('draftDripListId').isUUID().escape(),
];
