import { body } from 'express-validator';

export const startVotingRoundRequestRequestValidators = [
  body('startsAt').isISO8601().escape(),
  body('endsAt').isISO8601().escape(),
  body('dripListId')
    .if((value, { req }) => !req.body.name && !req.body.description)
    .isString()
    .isLength({ min: 36 })
    .escape(),
  body('dripListId')
    .if((value, { req }) => req.body.name || req.body.description)
    .custom((value) => !value)
    .withMessage(
      'dripListId must be empty when name or description are provided.',
    )
    .escape(),
  body('name')
    .if((value, { req }) => !req.body.dripListId)
    .isString()
    .isLength({ max: 50 })
    .escape(),
  body('description')
    .if((value, { req }) => !req.body.dripListId)
    .isString()
    .isLength({ max: 200 })
    .escape(),
  body('publisherAddress').isString().isLength({ min: 42, max: 42 }).escape(),
  body('publisherAddressDriverId')
    .isString()
    .not()
    .isEmpty()
    .isLength({ max: 78 })
    .escape(),
  body('collaborators').isArray().isLength({ min: 1, max: 50 }),
  body('collaborators.*.address').isString().isLength({ max: 42 }).escape(),
  body('collaborators.*.addressDriverId')
    .isString()
    .isLength({ max: 78 })
    .escape(),
];
