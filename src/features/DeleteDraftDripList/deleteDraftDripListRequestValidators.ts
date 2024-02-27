import { param } from 'express-validator';

export const deleteDraftDripListRequestRequestValidators = [
  param('draftDripListId').isUUID().escape(),
];
