import { body, param } from 'express-validator';

export const castVoteRequestValidators = [
  param('votingRoundId').isUUID().escape(),
  body('collaboratorAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .escape(),
  body('voteAllocations').isArray().not().isEmpty().isLength({ max: 200 }),
  body('voteAllocations.*.receiverId')
    .isString()
    .not()
    .isEmpty()
    .isLength({ max: 78 })
    .escape(),
  body('voteAllocations.*.weight').isNumeric(),
];
